import React, { useState, useEffect } from 'react';
import { Book, ChatSession, UserProfile, Message } from './types';
import { INITIAL_USER, INITIAL_BOOKS, INITIAL_CHATS, INDIAN_LOCATIONS } from './data';
import AuthScreen from './components/AuthScreen';
import DiscoverScreen from './components/DiscoverScreen';
import BookDetailScreen from './components/BookDetailScreen';
import ListBookScreen from './components/ListBookScreen';
import MessagesScreen from './components/MessagesScreen';
import ProfileScreen from './components/ProfileScreen';
import AdminScreen from './components/AdminScreen';
import { MapPin, Compass, Search, PlusCircle, MessageSquare, User, Filter, SlidersHorizontal, ChevronDown, Check, Shield, X } from 'lucide-react';
import { triggerEmailNotification, EmailNotification } from './lib/emailService';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType, sanitizeForFirestore } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, deleteDoc, onSnapshot, collection, query, where, orderBy, getDoc } from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [blocklistedUsers, setBlocklistedUsers] = useState<any[]>([]);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>([]);

  const [activeTab, setActiveTab] = useState<'discover' | 'list' | 'messages' | 'profile' | 'admin'>('discover');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [filterDistance, setFilterDistance] = useState<number>(5); // defaults to 5 kilometres
  const [isDistanceSheetOpen, setIsDistanceSheetOpen] = useState(false);

  // Real-time Firebase Synchronization
  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    let unsubBooks: (() => void) | null = null;
    let unsubChats: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // 1. Unsubscribe previous listeners first
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }
      if (unsubBooks) {
        unsubBooks();
        unsubBooks = null;
      }
      if (unsubChats) {
        unsubChats();
        unsubChats = null;
      }

      if (user) {
        // 1. Subscribe to User Profile document
        unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
          if (snap.exists()) {
            setCurrentUser(snap.data() as UserProfile);
          }
          setAuthInitializing(false);
        }, (error) => {
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          }
          setAuthInitializing(false);
        });

        // 2. Subscribe to Books listing
        unsubBooks = onSnapshot(collection(db, 'books'), async (snap) => {
          if (snap.empty) {
            try {
              const statusDocRef = doc(db, 'system_settings', 'seed_status');
              const statusDocSnap = await getDoc(statusDocRef);
              if (statusDocSnap.exists() && statusDocSnap.data()?.seeded) {
                // Already seeded before and then deleted intentionally. Keep empty.
                setBooks([]);
                return;
              }
              // Mark as seeded first
              await setDoc(statusDocRef, { seeded: true });
              INITIAL_BOOKS.forEach(async (book) => {
                await setDoc(doc(db, 'books', book.id), {
                  ...book,
                  sellerId: 'system_seed'
                });
              });
            } catch (err) {
              console.error("Error reading or setting seed status:", err);
            }
          } else {
            const booksList: Book[] = [];
            snap.forEach((d) => {
              booksList.push(d.data() as Book);
            });
            booksList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            setBooks(booksList);
          }
        }, (error) => {
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.LIST, 'books');
          }
        });

        // 3. Subscribe to Chats matching participant UIDs
        const chatsQuery = query(collection(db, 'chats'), where('participantIds', 'array-contains', user.uid));
        unsubChats = onSnapshot(chatsQuery, async (snap) => {
          const chatsList: ChatSession[] = [];
          snap.forEach((d) => {
            chatsList.push({ id: d.id, ...d.data() } as any);
          });
          setChats(chatsList);
        }, (error) => {
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.LIST, 'chats');
          }
        });
      } else {
        setCurrentUser(null);
        setAuthInitializing(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
      if (unsubBooks) unsubBooks();
      if (unsubChats) unsubChats();
    };
  }, []);

  // Listen for individual real-time messages for each chat session
  useEffect(() => {
    if (!currentUser || !auth.currentUser) return;

    const messageUnsubs: (() => void)[] = [];

    chats.forEach(chat => {
      const msgsQuery = query(collection(db, 'chats', chat.id, 'messages'), orderBy('createdAt', 'asc'));
      const unsubMsgs = onSnapshot(msgsQuery, (snap) => {
        const msgsList: Message[] = [];
        snap.forEach(docSnap => {
          const msgData = docSnap.data();
          msgsList.push({
            id: docSnap.id,
            sender: msgData.senderId === auth.currentUser?.uid ? 'me' : 'them',
            text: msgData.text,
            timestamp: msgData.timestamp,
            isMeetingPoint: msgData.isMeetingPoint,
            meetingLocation: msgData.meetingLocation,
            image: msgData.image,
            status: msgData.status || 'sent'
          });
        });
        setMessagesMap(prev => ({
          ...prev,
          [chat.id]: msgsList
        }));
      }, (error) => {
        if (auth.currentUser) {
          handleFirestoreError(error, OperationType.LIST, `chats/${chat.id}/messages`);
        }
      });
      messageUnsubs.push(unsubMsgs);
    });

    return () => {
      messageUnsubs.forEach(unsub => unsub());
    };
  }, [chats, currentUser]);

  // Admin-only user profiles database subscription
  useEffect(() => {
    if (!currentUser || currentUser.email !== 'burnster1826@gmail.com') {
      setAllUsers([]);
      return;
    }

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const usersList: any[] = [];
      snap.forEach((docSnap) => {
        usersList.push({ uid: docSnap.id, ...docSnap.data() });
      });
      setAllUsers(usersList);
    }, (error) => {
      console.error("Admin Users fetch error:", error);
    });

    return () => unsubUsers();
  }, [currentUser]);

  // Admin-only blocklisted user profiles subscription
  useEffect(() => {
    if (!currentUser || currentUser.email !== 'burnster1826@gmail.com') {
      setBlocklistedUsers([]);
      return;
    }

    const unsubBlocklist = onSnapshot(collection(db, 'blocklist'), (snap) => {
      const blocklist: any[] = [];
      snap.forEach((docSnap) => {
        blocklist.push({ uid: docSnap.id, ...docSnap.data() });
      });
      setBlocklistedUsers(blocklist);
    }, (error) => {
      console.error("Admin Blocklist fetch error:", error);
    });

    return () => unsubBlocklist();
  }, [currentUser]);

  // Real-time email notifications listener
  useEffect(() => {
    if (!currentUser || !auth.currentUser) {
      setEmailLogs([]);
      return;
    }

    const unsubNotifs = onSnapshot(collection(db, 'email_notifications'), (snap) => {
      const logsList: EmailNotification[] = [];
      const uid = auth.currentUser?.uid;
      snap.forEach((docSnap) => {
        const d = docSnap.data() as EmailNotification;
        if (d.senderId === uid || d.recipientId === uid) {
          logsList.push(d);
        }
      });
      // Sort newest first
      logsList.sort((a, b) => b.id.localeCompare(a.id));
      setEmailLogs(logsList);
    }, (error) => {
      console.error("Email Notifications fetch error:", error);
    });

    return () => unsubNotifs();
  }, [currentUser]);

  const handleAuthSuccess = (loggedInUser: UserProfile) => {
    setCurrentUser(loggedInUser);
    setActiveTab('discover');
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      setSelectedBook(null);
      setActiveChatId(null);
      setActiveTab('discover');
    }).catch((err) => {
      console.error("Sign out fail:", err);
    });
  };

  // Toggle book isLiked status in state & user profile
  const handleToggleLike = async (bookId: string) => {
    if (!currentUser || !auth.currentUser) return;
    
    const isLiked = currentUser.likedBookIds.includes(bookId);
    let updatedLikes: string[];

    if (isLiked) {
      updatedLikes = currentUser.likedBookIds.filter(id => id !== bookId);
    } else {
      updatedLikes = [...currentUser.likedBookIds, bookId];
    }

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        likedBookIds: updatedLikes
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  // Manual location written updater
  const handleLocationUpdate = async (newLoc: string) => {
    if (!currentUser || !auth.currentUser) return;
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        location: newLoc
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  // Profile data updates
  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser || !auth.currentUser) return;
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  // Posting new book listings
  const handlePostListing = async (newBookRaw: Omit<Book, 'id' | 'distance' | 'createdAt' | 'seller'>) => {
    if (!currentUser || !auth.currentUser) return;

    const bookId = `book-${Date.now()}`;
    const newBook: Book = {
      ...newBookRaw,
      id: bookId,
      distance: 0.5 + Math.random() * 4,
      createdAt: new Date().toISOString(),
      seller: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        rating: currentUser.rating,
        swaps: currentUser.swaps
      }
    } as any;

    try {
      await setDoc(doc(db, 'books', bookId), sanitizeForFirestore({
        ...newBook,
        sellerId: auth.currentUser.uid
      }));
      setActiveTab('discover');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `books/${bookId}`);
    }
  };

  const handleUnpublishBook = async (bookId: string) => {
    if (!currentUser || !auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'books', bookId));
      setSelectedBook(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `books/${bookId}`);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!currentUser || !auth.currentUser || currentUser.email !== 'burnster1826@gmail.com') return;
    try {
      // Find user details first from local state
      const targetUser = allUsers.find(u => u.uid === uid);
      if (targetUser) {
        // Save to 'blocklist' collection
        await setDoc(doc(db, 'blocklist', uid), {
          uid: targetUser.uid || uid,
          name: targetUser.name || 'Anonymous Reader',
          email: targetUser.email || '',
          avatar: targetUser.avatar || '',
          location: targetUser.location || '',
          isTrusted: targetUser.isTrusted || false,
          swaps: targetUser.swaps || 0,
          rating: targetUser.rating || 5,
          deletedAt: new Date().toISOString()
        });
      }

      // 1. Delete user doc
      await deleteDoc(doc(db, 'users', uid));
      
      // 2. Clean up listed books by this user in database
      const userBooks = books.filter(b => (b as any).sellerId === uid);
      for (const b of userBooks) {
        await deleteDoc(doc(db, 'books', b.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
    }
  };

  const handleUnblockUser = async (uid: string, userDetails: any) => {
    if (!currentUser || !auth.currentUser || currentUser.email !== 'burnster1826@gmail.com') return;
    try {
      // 1. Restore user back into the users collection
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: userDetails.name || 'Restored User',
        email: userDetails.email || '',
        avatar: userDetails.avatar || '',
        location: userDetails.location || '',
        isTrusted: userDetails.isTrusted || false,
        swaps: userDetails.swaps || 0,
        rating: userDetails.rating || 5,
        likedBookIds: userDetails.likedBookIds || []
      });

      // 2. Delete from blocklist
      await deleteDoc(doc(db, 'blocklist', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `blocklist/${uid}`);
    }
  };

  const handleDeleteBlocklistUserPermanently = async (uid: string) => {
    if (!currentUser || !auth.currentUser || currentUser.email !== 'burnster1826@gmail.com') return;
    try {
      await deleteDoc(doc(db, 'blocklist', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `blocklist/${uid}`);
    }
  };

  const handleToggleTrustUser = async (uid: string, currentStatus: boolean) => {
    if (!currentUser || !auth.currentUser || currentUser.email !== 'burnster1826@gmail.com') return;
    try {
      const nextStatus = !currentStatus;
      // 1. Toggle trust setting inside user's document
      await setDoc(doc(db, 'users', uid), {
        isTrusted: nextStatus
      }, { merge: true });

      // 2. Reflect trust status changes automatically across all book listings for this seller
      const userBooks = books.filter(b => (b as any).sellerId === uid);
      for (const b of userBooks) {
        await setDoc(doc(db, 'books', b.id), {
          seller: {
            ...b.seller,
            isTrusted: nextStatus
          }
        }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  // Messages coordination
  const handleSendMessage = async (chatId: string, text: string, image?: string) => {
    if (!currentUser || !auth.currentUser) return;

    const msgId = `msg-${Date.now()}`;
    const timestamp = "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const newMsg: any = {
      id: msgId,
      senderId: auth.currentUser.uid,
      text: text || "",
      timestamp,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    if (image) {
      newMsg.image = image;
    }

    try {
      await setDoc(doc(db, 'chats', chatId, 'messages', msgId), newMsg);

      // Trigger user-to-participant email notification
      const currentChat = chats.find(c => c.id === chatId);
      const isOnline = currentChat?.participant.isOnline || false;

      if (currentChat) {
        triggerEmailNotification({
          senderId: auth.currentUser?.uid || 'unknown',
          senderName: currentUser.name,
          recipientId: currentChat.participant.id,
          recipientName: currentChat.participant.name,
          recipientEmail: (currentChat.participant as any).email,
          bookTitle: currentChat.book.title,
          messageText: text || "Sent an image attachment"
        });
      }

      // Live Checkmarks transition: sent -> delivered -> read (simulated real-time)
      if (currentChat && isOnline) {
        // If they are online, we set it to 'delivered' immediately in Firestore
        await setDoc(doc(db, 'chats', chatId, 'messages', msgId), { status: 'delivered' }, { merge: true });

        // Then simulate they 'read' it (blue double tick) after 1.2 seconds
        setTimeout(async () => {
          try {
            await setDoc(doc(db, 'chats', chatId, 'messages', msgId), { status: 'read' }, { merge: true });
          } catch (e) {
            console.error("Failed transition to read:", e);
          }
        }, 1200);
      }

      // Trigger automatic reply shortly after sending
      if (currentChat) {
        setTimeout(async () => {
          const responseText = image 
            ? "Pristine! That picture looks amazing, the book is in stellar condition. Let's arrange a time to complete the sale!"
            : getRandomReply(currentChat.participant.name, text);
            
          const replyId = `msg-reply-${Date.now()}`;
          const replyMsg = {
            id: replyId,
            senderId: currentChat.participant.id,
            text: responseText,
            timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'chats', chatId, 'messages', replyId), replyMsg);

          // Trigger participant-to-user incoming email notification
          triggerEmailNotification({
            senderId: currentChat.participant.id,
            senderName: currentChat.participant.name,
            recipientId: auth.currentUser?.uid || 'unknown',
            recipientName: currentUser.name,
            recipientEmail: currentUser.email,
            bookTitle: currentChat.book.title,
            messageText: responseText
          });
        }, 1800); // Wait until after the read tick transition is complete to reply!
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}/messages`);
    }
  };

  const handleToggleParticipantOnline = async (chatId: string, currentOnlineStatus: boolean) => {
    try {
      const nextOnlineStatus = !currentOnlineStatus;
      await setDoc(doc(db, 'chats', chatId), {
        participant: {
          isOnline: nextOnlineStatus
        }
      }, { merge: true });

      // If turning online, deliver all 'sent' messages and mark as read
      if (nextOnlineStatus) {
        const msgs = messagesMap[chatId] || [];
        const sentMeMsgs = msgs.filter(m => m.sender === 'me' && (!m.status || m.status === 'sent'));
        
        // Mark as Delivered
        for (const msg of sentMeMsgs) {
          await setDoc(doc(db, 'chats', chatId, 'messages', msg.id), { status: 'delivered' }, { merge: true });
        }

        // After a small delay, mark as Read and reply
        if (sentMeMsgs.length > 0) {
          setTimeout(async () => {
            for (const msg of sentMeMsgs) {
              await setDoc(doc(db, 'chats', chatId, 'messages', msg.id), { status: 'read' }, { merge: true });
            }
          }, 1200);

          const lastUserMsg = sentMeMsgs[sentMeMsgs.length - 1];
          const currentChat = chats.find(c => c.id === chatId);
          if (currentChat && lastUserMsg) {
            setTimeout(async () => {
              const responseText = getRandomReply(currentChat.participant.name, lastUserMsg.text);
              const replyId = `msg-reply-${Date.now()}`;
              const replyMsg = {
                id: replyId,
                senderId: currentChat.participant.id,
                text: responseText,
                timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, 'chats', chatId, 'messages', replyId), replyMsg);
              
              triggerEmailNotification({
                senderId: currentChat.participant.id,
                senderName: currentChat.participant.name,
                recipientId: auth.currentUser?.uid || 'unknown',
                recipientName: currentUser.name,
                recipientEmail: currentUser.email,
                bookTitle: currentChat.book.title,
                messageText: responseText
              });
            }, 2000);
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}`);
    }
  };

  const getRandomReply = (name: string, userMsg: string): string => {
    const lowercase = userMsg.toLowerCase();
    if (lowercase.includes('meet') || lowercase.includes('when') || lowercase.includes('time')) {
      return `That works perfectly for me near the Metro corner! Should I bring any other books from my collection?`;
    }
    if (lowercase.includes('price') || lowercase.includes('condition') || lowercase.includes('rupees') || lowercase.includes('cost') || lowercase.includes('buy')) {
      return `The pages are indeed pristine. It is priced as listed, or I can offer a small discount if you pick up multiple books!`;
    }
    return `I can't wait to hand over this book. Let's exchange details at our meeting point. See you there soon.`;
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
      if (auth.currentUser) {
        await setDoc(doc(db, 'chats_seeded', auth.currentUser.uid), { seeded: true });
      }
      await deleteDoc(doc(db, 'chats', chatId));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}`);
    }
  };

  // Message Seller routing logic
  const handleStartMessage = async (book: Book) => {
    if (!currentUser || !auth.currentUser) return;

    // Check if we already have a chat session with this seller for this book
    const existing = chats.find(c => c.participant.name === book.seller.name && c.book.title === book.title);

    if (existing) {
      setActiveChatId(existing.id);
      setActiveTab('messages');
      setSelectedBook(null); // release detail lock
      return;
    }

    const chatId = `chat-${Date.now()}`;
    const sellerUid = (book as any).sellerId || `seller-${Date.now()}`;
    const newChat = {
      id: chatId,
      participantIds: [auth.currentUser.uid, sellerUid],
      participant: {
        id: sellerUid,
        name: book.seller.name,
        avatar: book.seller.avatar,
        rating: book.seller.rating,
        unreadCount: 0,
        isOnline: true
      },
      book: {
        id: book.id,
        title: book.title,
        price: book.price,
        cover: book.images[0]
      }
    };

    const firstMsgId = `msg-init-${Date.now()}`;
    const firstMsg = {
      id: firstMsgId,
      senderId: sellerUid,
      text: `Hi! I listed "${book.title}" for sale in our local book group. Are you interested in purchasing it?`,
      timestamp: "Today, " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'chats', chatId), newChat);
      await setDoc(doc(db, 'chats', chatId, 'messages', firstMsgId), firstMsg);

      setActiveChatId(chatId);
      setActiveTab('messages');
      setSelectedBook(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}`);
    }
  };

  if (authInitializing) {
    return (
      <div className="min-h-screen bg-nocturnal-bg flex flex-col items-center justify-center p-6 text-on-surface">
        <div className="w-10 h-10 border-2 border-primary-lavender border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-serif text-sm text-primary-lavender animate-pulse">Initializing BookLoop Sync...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Derived chats structure with real-time streams merged
  const chatsWithMessages = chats.map((chat) => ({
    ...chat,
    messages: messagesMap[chat.id] || []
  }));

  // Derived books structure with dynamic isLiked flag
  const mappedBooks = books.map((book) => ({
    ...book,
    isLiked: currentUser.likedBookIds.includes(book.id)
  }));

  return (
    <div id="bookloop-app-root" className="min-h-screen md:min-h-screen md:max-h-screen md:h-screen md:overflow-hidden bg-nocturnal-bg text-on-surface flex flex-col md:flex-row relative overflow-x-hidden antialiased">
      
      {/* DESKTOP STICKY SIDEBAR RAIL (Visible on md and up) */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r border-nocturnal-border/30 bg-nocturnal-surface-low/55 p-6 gap-6 h-screen sticky top-0 select-none z-40 shrink-0">
        <div className="flex flex-col gap-2 pb-4 border-b border-nocturnal-border/15">
          <h1 className="font-serif text-2xl font-bold tracking-tight text-primary-lavender">
            BookLoop
          </h1>
          <button
            onClick={() => setIsDistanceSheetOpen(true)}
            className="flex items-center gap-1.5 text-xs font-sans font-bold text-nocturnal-outline hover:text-primary-lavender transition-colors duration-150 cursor-pointer text-left"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-lavender shrink-0" />
            <span className="truncate max-w-[130px]">{currentUser.location}</span>
            <span className="shrink-0">({filterDistance === Infinity ? '∞' : `${filterDistance} km`})</span>
            <ChevronDown className="w-3.5 h-3.5 text-primary-lavender shrink-0" />
          </button>
        </div>

        {/* Sidebar Nav Buttons */}
        <div className="flex-1 flex flex-col gap-2 pt-2">
          {/* Discover Button */}
          <button
            onClick={() => {
              setActiveTab('discover');
              setSelectedBook(null);
            }}
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
              activeTab === 'discover' && !selectedBook
                ? 'bg-primary-lavender/10 text-primary-lavender border border-primary-lavender/25'
                : 'text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high/30'
            }`}
          >
            <Compass className="w-4.5 h-4.5 shrink-0" />
            <span>Discover Books</span>
          </button>

          {/* List Book Button */}
          <button
            onClick={() => {
              setActiveTab('list');
              setSelectedBook(null);
            }}
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-primary-lavender/10 text-primary-lavender border border-primary-lavender/25'
                : 'text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high/30'
            }`}
          >
            <PlusCircle className="w-4.5 h-4.5 shrink-0" />
            <span>List A Copy</span>
          </button>

          {/* Chat Messages Button */}
          <button
            onClick={() => {
              setActiveTab('messages');
              setSelectedBook(null);
              setActiveChatId(null);
            }}
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-primary-lavender/10 text-primary-lavender border border-primary-lavender/25'
                : 'text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high/30'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-4.5 h-4.5 shrink-0" />
            </div>
            <span>Book Inboxes</span>
          </button>

          {/* Profile card Button */}
          <button
            onClick={() => {
              setActiveTab('profile');
              setSelectedBook(null);
            }}
            className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-primary-lavender/10 text-primary-lavender border border-primary-lavender/25'
                : 'text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high/30'
            }`}
          >
            <User className="w-4.5 h-4.5 shrink-0" />
            <span>My Library Card</span>
          </button>

          {/* Admin Console Button (Only shown if user email is burnster1826@gmail.com) */}
          {currentUser?.email === 'burnster1826@gmail.com' && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setSelectedBook(null);
              }}
              className={`flex items-center gap-3.5 w-full py-3 px-4 rounded-xl font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-primary-lavender/10 text-primary-lavender border border-primary-lavender/25'
                  : 'text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high/30'
              }`}
            >
              <Shield className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'admin' ? 'text-primary-lavender' : ''}`} />
              <span>Admin Console</span>
            </button>
          )}
        </div>

        {/* Footer Area with safe tags/signout */}
        <div className="pt-4 border-t border-nocturnal-border/15 flex flex-col gap-2 text-left">
          <div className="flex items-center gap-2 text-[10px] font-sans text-nocturnal-outline">
            <Shield className="w-3.5 h-3.5 text-primary-lavender shrink-0" />
            <span className="font-semibold tracking-wider uppercase">India Used Book Market</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[10px] text-red-400 hover:text-red-300 font-sans font-bold hover:underline py-1 transition-all text-left"
          >
            Sign Out Card
          </button>
        </div>
      </aside>

      {/* CONTENT SYSTEM FRAME (Takes remaining width on desktop, full width on mobile) */}
      <div className={`flex-1 flex flex-col relative overflow-x-hidden ${activeTab === 'messages' ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen md:h-screen md:max-h-screen md:overflow-y-auto'}`}>
        
        {/* MOBILE SCREEN BAR ONLY (md:hidden) */}
        {!selectedBook && !activeChatId && (
          <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 h-16 bg-nocturnal-surface/85 backdrop-blur-md border-b border-nocturnal-border/30 select-none">
            <div className="flex flex-col">
              <h1 className="font-serif text-xl font-extrabold text-primary-lavender bg-clip-text">
                BookLoop
              </h1>
              <button
                onClick={() => setIsDistanceSheetOpen(true)}
                className="flex items-center gap-1 text-[11px] font-sans font-bold text-nocturnal-outline hover:text-primary-lavender transition-colors duration-150 cursor-pointer text-left"
              >
                <MapPin className="w-3 h-3 text-primary-lavender" />
                <span className="truncate max-w-[150px]">{currentUser.location}</span>
                <span className="shrink-0">({filterDistance === Infinity ? '∞' : `${filterDistance} km`})</span>
                <ChevronDown className="w-3 h-3 text-primary-lavender" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert("BookLoop Local Search helper: Start typing in the query bar below to immediately filter nearby books!")}
                className="p-2.5 rounded-full hover:bg-nocturnal-surface-high transition-colors active:scale-95 cursor-pointer text-primary-lavender"
              >
                <Search className="w-5 h-5 text-primary-lavender" />
              </button>
            </div>
          </header>
        )}

        {/* MAIN SCROLLABLE WRAPPER CANVAS */}
        <main 
          className={`flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col min-h-0 ${
            activeTab === 'messages' 
              ? `h-full max-h-full overflow-hidden ${
                  activeChatId 
                    ? 'pt-4 pb-4 md:pt-8 md:pb-4' 
                    : 'pt-20 pb-28 md:pt-8 md:pb-4'
                }` 
              : `pb-28 ${
                  (!selectedBook && !activeChatId) 
                    ? 'pt-20 md:pt-8' 
                    : 'pt-4 md:pt-8'
                }`
          }`}
        >
          {/* Dynamic Screen Routing */}
          <AnimatePresence mode="wait">
            {selectedBook ? (
              /* Selected Book Details Screen Override */
              <motion.div
                key="book-details"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BookDetailScreen
                  book={selectedBook}
                  user={currentUser}
                  onBack={() => setSelectedBook(null)}
                  onToggleLike={handleToggleLike}
                  onStartMessage={handleStartMessage}
                  onUnpublishBook={handleUnpublishBook}
                />
              </motion.div>
            ) : (
              /* Render standard Tab Screens */
              <div className={`h-full min-h-0 ${activeTab === 'messages' ? 'flex flex-col flex-grow' : ''}`}>
                {activeTab === 'discover' && (
                  <DiscoverScreen
                    books={mappedBooks}
                    user={currentUser}
                    onBookSelect={setSelectedBook}
                    onToggleLike={handleToggleLike}
                    onOpenDistanceFilter={() => setIsDistanceSheetOpen(true)}
                    onUpdateDistanceFilter={setFilterDistance}
                    filterDistance={filterDistance}
                  />
                )}

                {activeTab === 'list' && (
                  <ListBookScreen
                    user={currentUser}
                    onPostListing={handlePostListing}
                    onLocationUpdate={handleLocationUpdate}
                  />
                )}

                {activeTab === 'messages' && (
                  <MessagesScreen
                    chats={chatsWithMessages}
                    onSendMessage={handleSendMessage}
                    onSelectChat={setActiveChatId}
                    activeChatId={activeChatId}
                    onDeleteChat={handleDeleteChat}
                    emailLogs={emailLogs}
                    onToggleParticipantOnline={handleToggleParticipantOnline}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileScreen
                    user={currentUser}
                    userListedBooks={mappedBooks.filter(b => b.seller.name === currentUser.name)}
                    allBooks={mappedBooks}
                    onSelectBook={setSelectedBook}
                    onSignOut={handleSignOut}
                    onUpdateProfile={handleUpdateProfile}
                    emailLogs={emailLogs}
                  />
                )}

                {activeTab === 'admin' && currentUser?.email === 'burnster1826@gmail.com' && (
                  <AdminScreen
                    user={currentUser}
                    users={allUsers}
                    books={mappedBooks}
                    onDeleteUser={handleDeleteUser}
                    onDeleteBook={handleUnpublishBook}
                    onToggleTrustUser={handleToggleTrustUser}
                    blocklistedUsers={blocklistedUsers}
                    onUnblockUser={handleUnblockUser}
                    onDeleteBlocklistUserPermanently={handleDeleteBlocklistUserPermanently}
                  />
                )}
              </div>
            )}
          </AnimatePresence>
        </main>

        {/* MOBILE NAVIGATION BAR ONLY (md:hidden) */}
        {!activeChatId && !selectedBook && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pt-2.5 pb-6 bg-nocturnal-surface-low border-t border-nocturnal-border/40 select-none rounded-t-xl shadow-2xl">
            {/* Discover Screen Tab */}
            <button
              onClick={() => {
                setActiveTab('discover');
                setSelectedBook(null); // clears details to return to listing
              }}
              className={`flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                activeTab === 'discover' && !selectedBook
                  ? 'text-primary-lavender scale-103 bg-primary-lavender/10 px-4 py-1.5 rounded-xl border border-primary-lavender/20'
                  : 'text-nocturnal-outline hover:text-on-surface'
              }`}
            >
              <Compass className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-sans mt-1 font-semibold">Discover</span>
            </button>

            {/* List A Book Tab */}
            <button
              onClick={() => {
                setActiveTab('list');
                setSelectedBook(null);
              }}
              className={`flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                activeTab === 'list'
                  ? 'text-primary-lavender scale-103 bg-primary-lavender/10 px-4 py-1.5 rounded-xl border border-primary-lavender/20'
                  : 'text-nocturnal-outline hover:text-on-surface'
              }`}
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-sans mt-1 font-semibold">List</span>
            </button>

            {/* Active Chats Tab */}
            <button
              onClick={() => {
                setActiveTab('messages');
                setSelectedBook(null);
                setActiveChatId(null); // return to chat list
              }}
              className={`flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                activeTab === 'messages'
                  ? 'text-primary-lavender scale-103 bg-primary-lavender/10 px-4 py-1.5 rounded-xl border border-primary-lavender/20'
                  : 'text-nocturnal-outline hover:text-on-surface'
              }`}
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-sans mt-1 font-semibold">Messages</span>
            </button>

            {/* Profile Library Tab */}
            <button
              onClick={() => {
                setActiveTab('profile');
                setSelectedBook(null);
              }}
              className={`flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                activeTab === 'profile'
                  ? 'text-primary-lavender scale-103 bg-primary-lavender/10 px-4 py-1.5 rounded-xl border border-primary-lavender/20'
                  : 'text-nocturnal-outline hover:text-on-surface'
              }`}
            >
              <User className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-sans mt-1 font-semibold">Profile</span>
            </button>

            {/* Admin Console Tab (Only shown if user email is burnster1826@gmail.com) */}
            {currentUser?.email === 'burnster1826@gmail.com' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setSelectedBook(null);
                }}
                className={`flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'text-primary-lavender scale-103 bg-primary-lavender/10 px-4 py-1.5 rounded-xl border border-primary-lavender/20'
                    : 'text-nocturnal-outline hover:text-on-surface'
                }`}
              >
                <Shield className="w-5 h-5 shrink-0" />
                <span className="text-[10px] font-sans mt-1 font-semibold">Admin</span>
              </button>
            )}
          </nav>
        )}
      </div>

      {/* RADIUS RANGE BOTTOM SHEET (Modal choices shared layout system) */}
      <AnimatePresence>
        {isDistanceSheetOpen && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDistanceSheetOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Slide up sheet panel container matches mobile layout exactly */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-nocturnal-surface border-t border-nocturnal-border rounded-t-2xl p-6 relative z-10 space-y-6 max-w-md mx-auto w-full"
            >
              {/* Drag Handle indicator */}
              <div className="w-12 h-1 bg-nocturnal-border/80 rounded-full mx-auto" />

              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-primary-lavender flex items-center justify-center gap-1.5 leading-none">
                  <SlidersHorizontal className="w-4 h-4 text-primary-lavender" /> Distance Filter
                </h3>
                <p className="text-xs text-nocturnal-outline font-sans">
                  Find sellers within a comfortable walk or short commute
                </p>
              </div>

              {/* Distances filter circle bento choices */}
              <div className="grid grid-cols-2 gap-3.5">
                {([5, 10, 25, 50, Infinity] as const).map((dist) => {
                  const isSelected = filterDistance === dist;
                  return (
                    <button
                      key={dist.toString()}
                      type="button"
                      onClick={() => setFilterDistance(dist)}
                      className={`py-4 rounded-xl border font-sans text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                        dist === Infinity ? 'col-span-2' : ''
                      } ${
                        isSelected
                          ? 'bg-primary-lavender/15 border-primary-lavender text-primary-lavender ring-1 ring-primary-lavender/30 shadow'
                          : 'bg-nocturnal-surface-low border-nocturnal-border/60 text-on-surface hover:border-primary-lavender/30'
                      }`}
                    >
                      {dist === Infinity ? '∞ (Infinity)' : `${dist} km`} {isSelected && <Check className="w-4 h-4 text-primary-lavender shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setIsDistanceSheetOpen(false)}
                  className="w-full py-3.5 bg-primary-lavender text-primary-lavender-dark font-sans font-bold text-xs rounded-xl active:scale-95 transition-transform shadow-md cursor-pointer"
                >
                  Apply Circle Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Atmospheric Soft Cosmic overlay background for midnight immersive library depth */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(179,157,219,0.03),transparent_50%)]"></div>
    </div>
  );
}
