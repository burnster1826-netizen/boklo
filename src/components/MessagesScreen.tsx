import React, { useState, useRef } from 'react';
import { ChatSession, Book, Message } from '../types';
import { Send, MapPin, Plus, ArrowLeft, MoreVertical, BookOpen, Circle, Landmark, Camera, Image, X, FileImage, Trash2, Mail, Settings, Check, Loader2, Inbox, Bell, Sparkles, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailNotification } from '../lib/emailService';

interface MessagesScreenProps {
  chats: ChatSession[];
  onSendMessage: (chatId: string, text: string, image?: string) => void;
  onSelectChat: (chatId: string | null) => void;
  activeChatId: string | null;
  onDeleteChat?: (chatId: string) => void;
  emailLogs?: EmailNotification[];
  onToggleParticipantOnline?: (chatId: string, currentOnlineStatus: boolean) => void;
}

export default function MessagesScreen({
  chats,
  onSendMessage,
  onSelectChat,
  activeChatId,
  onDeleteChat,
  emailLogs = [],
  onToggleParticipantOnline
}: MessagesScreenProps) {
  const [typedMessage, setTypedMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [confirmDeleteChatId, setConfirmDeleteChatId] = useState<string | null>(null);
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    copyToInbox: true,
    includeImages: true,
    periodicDigest: false
  });
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderStatusTick = (status?: 'sent' | 'delivered' | 'read') => {
    const size = "w-3.5 h-3.5";
    if (!status || status === 'sent') {
      return (
        <Check className={`${size} text-primary-lavender-dark/65 shrink-0 stroke-[2.5]`} title="Sent" />
      );
    }
    if (status === 'delivered') {
      return (
        <CheckCheck className={`${size} text-primary-lavender-dark/70 shrink-0 stroke-[2.5]`} title="Delivered" />
      );
    }
    if (status === 'read') {
      return (
        <CheckCheck className={`${size} text-sky-700 shrink-0 stroke-[3] drop-shadow-[0_0_1px_rgba(3,105,161,0.2)]`} title="Seen" />
      );
    }
    return null;
  };

  const currentChat = chats.find(c => c.id === activeChatId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId) return;
    if (!typedMessage.trim() && !selectedImage) return;

    onSendMessage(activeChatId, typedMessage.trim(), selectedImage || undefined);
    setTypedMessage('');
    setSelectedImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Please select a photo smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsAttachmentOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getUnreadChatsCount = () => {
    return chats.reduce((acc, c) => acc + (c.participant.unreadCount > 0 ? 1 : 0), 0);
  };

  return (
    <div className="h-full min-h-0 flex flex-col select-none">
      {/* Responsive layout container: Dual panel on desktop, single flow on mobile */}
      <div className="hidden md:grid md:grid-cols-12 gap-6 h-full min-h-0">
        {/* Left conversations panel (5 columns grid span) */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-nocturnal-border/20 pr-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
          <div>
            <h2 className="font-serif text-lg font-bold text-on-surface">Active Chats</h2>
            <p className="text-[11px] font-sans text-nocturnal-outline mt-0.5">
              {getUnreadChatsCount()} unread notifications
            </p>
          </div>


          <div className="flex flex-col gap-2.5">
            {chats.map((chat) => {
              const latestMsg = chat.messages[chat.messages.length - 1];
              const hasUnread = chat.participant.unreadCount > 0;
              const isSelected = chat.id === activeChatId;

              return (
                <div
                  key={`desktop-chat-${chat.id}`}
                  onClick={() => {
                    onSelectChat(chat.id);
                    chat.participant.unreadCount = 0;
                  }}
                  className={`flex items-center gap-3 p-3.5 bg-nocturnal-surface-low border rounded-xl hover:bg-nocturnal-surface-high cursor-pointer transition-all duration-150 relative group ${
                    isSelected
                      ? 'border-primary-lavender bg-primary-lavender/[0.04]'
                      : hasUnread 
                      ? 'border-primary-lavender/30 ring-1 ring-primary-lavender/5' 
                      : 'border-nocturnal-border/40 opacity-90'
                  }`}
                >
                  {/* Premium Hover Delete Button */}
                  {onDeleteChat && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteChatId(chat.id);
                      }}
                      className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 focus:opacity-100 text-nocturnal-outline hover:text-accent-terracotta bg-nocturnal-surface-low/90 border border-nocturnal-border hover:border-accent-terracotta/40 p-1.5 rounded-lg shadow-md transition-all duration-150 cursor-pointer z-10"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="relative shrink-0">
                    <img
                      src={chat.participant.avatar || null}
                      alt={chat.participant.name}
                      className="w-11 h-11 rounded-full object-cover border border-nocturnal-border"
                    />
                    {hasUnread && (
                      <div className="absolute bottom-0 right-0 message-unread-indicator"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-serif text-[13px] font-bold text-on-surface truncate pr-6">
                        {chat.participant.name}
                      </span>
                      <div className="flex items-center gap-1.5 select-none shrink-0">
                        <span className="font-sans text-[9px] text-nocturnal-outline group-hover:opacity-0 transition-opacity duration-150">
                          {latestMsg ? latestMsg.timestamp.split(', ')[1] || latestMsg.timestamp : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {chat.book.cover && (
                        <img
                          src={chat.book.cover || null}
                          alt="Cover Mini"
                          className="w-5 h-7 rounded-sm object-cover border border-nocturnal-border shrink-0"
                        />
                      )}
                      <p className={`font-sans text-[11px] truncate flex-1 ${hasUnread ? 'text-on-surface font-semibold' : 'text-nocturnal-outline'}`}>
                        {latestMsg ? latestMsg.text : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right message dialog workspace (7+ columns grid span) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full min-h-0 justify-between">
          <AnimatePresence mode="wait">
            {currentChat ? (
              <motion.div
                key={`desktop-chat-window-${currentChat.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full min-h-0 justify-between"
              >
                {/* Active chat header with peer info */}
                <div className="flex items-center justify-between pb-3.5 border-b border-nocturnal-border/30 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={currentChat.participant.avatar || null}
                        alt={currentChat.participant.name}
                        className="w-10 h-10 rounded-full object-cover border border-nocturnal-border"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-on-surface leading-none">
                        {currentChat.participant.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleParticipantOnline?.(currentChat.id, currentChat.participant.isOnline)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none ${
                            currentChat.participant.isOnline
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-nocturnal-surface-lowest border-nocturnal-border/40 text-nocturnal-outline'
                          }`}
                          title="Click to toggle recipient's online status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${currentChat.participant.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-nocturnal-outline'}`} />
                          <span>{currentChat.participant.isOnline ? 'Online' : 'Offline'}</span>
                        </button>
                        <span className="text-[8px] font-sans text-nocturnal-outline/80 italic select-none">(Click to test ticks)</span>
                      </div>
                    </div>
                  </div>

                  {/* Curated volume mini-badge summary and actions */}
                  <div className="flex items-center gap-3">
                    {onDeleteChat && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteChatId(currentChat.id)}
                        className="h-9 px-3.5 bg-transparent hover:bg-red-500/10 border border-nocturnal-border hover:border-red-500/30 text-nocturnal-outline hover:text-red-400 rounded-xl flex items-center gap-1.5 transition-all duration-150 cursor-pointer text-xs font-sans font-bold"
                        title="Delete conversation history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Chat</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 bg-nocturnal-surface-low border border-nocturnal-border/30 rounded-lg p-1 px-2.5 max-w-[220px]">
                      {currentChat.book.cover && (
                        <img
                          src={currentChat.book.cover || null}
                          alt="Book Mini"
                          className="w-6 h-8 rounded-sm object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] text-on-surface font-bold truncate leading-snug">
                          {currentChat.book.title}
                        </p>
                        <p className="text-[9.5px] text-primary-lavender font-extrabold font-sans mt-0.5 leading-none">
                          {currentChat.book.price === 0 ? "Free" : `₹${currentChat.book.price}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrolled chat messages stream layout list */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-3.5 pr-1.5">
                  {currentChat.messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <div key={`desktop-msg-${msg.id}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                        {msg.isMeetingPoint ? (
                          <div className="max-w-[70%] bg-nocturnal-surface border border-primary-lavender/30 rounded-2xl overflow-hidden shadow-lg relative">
                            <div className="h-24 w-full relative overflow-hidden bg-nocturnal-surface-low border-b border-nocturnal-border/30">
                              <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKyjJOBgihHRzYq70q6HeUlHyuIUgVZ0A-zXs1i3GMVVEgdgxBqTqkTgVogwBsxqJtcaHgEenHspH8CljUvNL13D92Jk7P58fTpA-M_XbFuRu6dSnTPJtPSOCg1qu5IFJRO_wGLgq_TuehtfRSLMvtSXp60Gf9UAzuzwZdNkdwLhWJca2IOoBSV8mFtmBc-P3kLLrjdo-7IjN3XOB0l295BihANGOABWWf8mHrf0b9UzlyRbyMgiRMuX61GC8NOhfk0DNbWK6I2_jf"
                                alt="Map location"
                                className="w-full h-full object-cover opacity-50 grayscale contrast-125"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-primary-lavender drop-shadow-[0_0_8px_rgba(211,188,252,0.8)] fill-primary-lavender/30" />
                              </div>
                            </div>
                            <div className="p-3 flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded bg-primary-lavender/10 border border-primary-lavender/25 flex items-center justify-center">
                                <Landmark className="w-3.5 h-3.5 text-primary-lavender" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-sans font-bold text-on-surface uppercase tracking-wider">
                                  Arranged meeting point
                                </p>
                                <p className="text-xs text-nocturnal-outline font-sans font-semibold mt-0.5">
                                  {msg.meetingLocation}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={`max-w-[70%] overflow-hidden ${
                            isMe 
                              ? 'chat-bubble-right bg-primary-lavender text-primary-lavender-dark p-3 px-4' 
                              : 'chat-bubble-left bg-nocturnal-surface-high border-nocturnal-border/40 p-3 px-4'
                          }`}>
                            {msg.image && (
                              <div className="mb-2 max-w-full rounded-lg overflow-hidden border border-nocturnal-border/20 shadow-md">
                                <img
                                  src={msg.image}
                                  alt="Sent Condition Detail"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-auto max-h-48 object-cover cursor-zoom-in hover:scale-[1.01] transition-transform"
                                  onClick={() => setZoomedImage(msg.image || null)}
                                />
                              </div>
                            )}
                            {msg.text && (
                              <p className="text-xs font-sans leading-relaxed break-words">
                                {msg.text}
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-1 mt-1.5 select-none">
                              <span className="block text-[8px] opacity-70 font-mono leading-none">
                                {msg.timestamp.split(', ')[1] || msg.timestamp}
                              </span>
                              {isMe && renderStatusTick(msg.status)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Input action toolbar interface */}
                <form onSubmit={handleSend} className="pt-3 border-t border-nocturnal-border/30 shrink-0 relative">
                  {/* Photo attachment popover drawer */}
                  <AnimatePresence>
                    {isAttachmentOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute bottom-16 left-0 right-0 bg-nocturnal-surface-high border border-nocturnal-border/80 rounded-2xl p-4 shadow-xl z-30 flex flex-col gap-3.5"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-nocturnal-border/30">
                          <span className="text-xs font-serif font-bold text-on-surface">Share book photos</span>
                          <button 
                            type="button" 
                            onClick={() => setIsAttachmentOpen(false)} 
                            className="text-nocturnal-outline hover:text-on-surface transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* File upload option */}
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-3 p-3 bg-nocturnal-surface-low rounded-xl border border-dashed border-nocturnal-border hover:bg-nocturnal-surface-highest transition-colors cursor-pointer text-left group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary-lavender/15 flex items-center justify-center text-primary-lavender shrink-0 transition-transform group-hover:scale-110">
                              <Camera className="w-4 h-4 text-primary-lavender" />
                            </div>
                            <div>
                              <p className="text-xs font-sans font-bold text-on-surface">Upload from device</p>
                              <p className="text-[10px] text-nocturnal-outline mt-0.5">Take photo or browse local library</p>
                            </div>
                          </button>

                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Attachment Preview Card */}
                  {selectedImage && (
                    <div className="flex items-center gap-3 p-2 bg-nocturnal-surface-high border border-nocturnal-border/40 rounded-xl mb-3 relative animate-fadeIn">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-nocturnal-border shrink-0">
                        <img 
                          src={selectedImage} 
                          alt="Preview Attachment" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans font-bold text-on-surface">Photo Attached</p>
                        <p className="text-[10px] text-nocturnal-outline truncate leading-snug">
                          Press send to share this book condition image.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl bg-nocturnal-surface-low border hover:bg-nocturnal-surface-high text-nocturnal-outline hover:text-on-surface active:scale-90 transition-transform cursor-pointer shrink-0 ${isAttachmentOpen ? 'border-primary-lavender text-primary-lavender' : 'border-nocturnal-border/60'}`}
                    >
                      <Image className="w-4 h-4" />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
                        className="w-full bg-nocturnal-surface-low border border-nocturnal-border/80 rounded-full py-2.5 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary-lavender placeholder-nocturnal-outline focus:ring-1 focus:ring-primary-lavender/25 transition-all outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-lavender hover:bg-lavender-container text-primary-lavender-dark shadow-md shadow-primary-lavender/30 active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 text-primary-lavender-dark stroke-[2.5]" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-75 border border-dashed border-nocturnal-border/40 rounded-2xl p-6">
                <BookOpen className="w-12 h-12 text-nocturnal-outline animate-bounce mb-3 stroke-1.5" />
                <h4 className="font-serif text-sm font-bold text-on-surface">No Chat Selected</h4>
                <p className="text-xs text-nocturnal-outline max-w-xs mt-1.5 leading-relaxed">
                  Select a conversation from the local neighborhood list on the left to review book conditions, discuss pricing and arrange secure local pickups!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE CONTAINER (Standard flow layout on mobile screens) */}
      <div className="md:hidden h-full min-h-0 flex flex-col">
        <AnimatePresence mode="wait">
          {!activeChatId ? (
            /* ACTIVE CHATS LIST VIEW INITIALIZER */
            <motion.div
              key="chat-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full space-y-4 pb-2"
            >
              <div className="shrink-0 animate-fadeIn">
                <h2 className="font-serif text-2xl font-bold text-on-surface">Active Chats</h2>
                <p className="text-xs font-sans text-nocturnal-outline mt-1 leading-relaxed">
                  {getUnreadChatsCount()} unread messages from your local reader community
                </p>
              </div>

              {/* Conversations Loop */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 pb-6">
                {chats.map((chat) => {
                  const latestMsg = chat.messages[chat.messages.length - 1];
                  const hasUnread = chat.participant.unreadCount > 0;
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        chat.participant.unreadCount = 0; // mark as read
                      }}
                      className={`flex items-center gap-3.5 p-4 bg-nocturnal-surface-low border rounded-xl hover:bg-nocturnal-surface-high cursor-pointer transition-all duration-200 active:scale-98 ${
                        hasUnread ? 'border-primary-lavender/30 ring-1 ring-primary-lavender/5' : 'border-nocturnal-border/40 opacity-90'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {chat.participant.avatar ? (
                          <img
                            src={chat.participant.avatar || null}
                            alt={chat.participant.name}
                            className="w-14 h-14 rounded-full object-cover border border-nocturnal-border"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-primary-lavender/10 border border-primary-lavender text-primary-lavender flex items-center justify-center font-serif text-lg font-bold">
                            {chat.participant.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}

                        {/* Online dot or unread dot */}
                        {hasUnread && (
                          <div className="absolute bottom-0 right-0 message-unread-indicator"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-serif text-[15px] font-bold text-on-surface">
                            {chat.participant.name}
                          </span>
                          <div className="flex items-center gap-2 relative">
                            <span className={`font-sans text-[10px] ${hasUnread ? 'text-primary-lavender font-semibold' : 'text-nocturnal-outline'} mr-1`}>
                              {latestMsg ? latestMsg.timestamp.split(', ')[1] || latestMsg.timestamp : ''}
                            </span>
                            {onDeleteChat && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteChatId(chat.id);
                                }}
                                className="w-7 h-7 flex items-center justify-center text-nocturnal-outline hover:text-accent-terracotta bg-nocturnal-surface border border-nocturnal-border hover:border-accent-terracotta/40 hover:bg-accent-terracotta/10 rounded-lg transition-all cursor-pointer shrink-0"
                                title="Delete Chat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {chat.book.cover && (
                            <img
                              src={chat.book.cover || null}
                              alt="Book Miniature Cover"
                              className="w-7 h-9 rounded-sm object-cover border border-nocturnal-border shrink-0"
                            />
                          )}
                          <p className={`font-sans text-xs truncate flex-1 ${hasUnread ? 'text-on-surface font-medium' : 'text-nocturnal-outline'}`}>
                            {latestMsg ? latestMsg.text : 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* ACTIVE SINGLE CHAT DIALOGUE WINDOW VIEW WITH ELENA/MARCUS */
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              className="flex flex-col h-full min-h-0"
            >
              {/* Header detail row with custom Online/Offline status matching Elena's details */}
              <div className="flex items-center justify-between pb-4 border-b border-nocturnal-border/40 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectChat(null)}
                    className="w-9 h-9 rounded-full bg-nocturnal-surface-low border border-nocturnal-border/40 flex items-center justify-center text-on-surface active:scale-90 transition-transform cursor-pointer"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {currentChat?.participant.avatar ? (
                        <img
                          src={currentChat.participant.avatar || null}
                          alt={currentChat?.participant.name}
                          className="w-10 h-10 rounded-full object-cover border border-nocturnal-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-lavender/10 border border-primary-lavender text-primary-lavender flex items-center justify-center font-serif text-sm font-bold">
                          {currentChat?.participant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif text-sm font-bold text-on-surface leading-none">
                        {currentChat?.participant.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => currentChat && onToggleParticipantOnline?.(currentChat.id, currentChat.participant.isOnline)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold transition-all active:scale-95 cursor-pointer select-none ${
                            currentChat?.participant.isOnline
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                              : 'bg-nocturnal-surface-lowest border-nocturnal-border/40 text-nocturnal-outline'
                          }`}
                          title="Click to toggle recipient's online status"
                        >
                          <span className={`w-1.2 h-1.2 rounded-full ${currentChat?.participant.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-nocturnal-outline'}`} />
                          <span>{currentChat?.participant.isOnline ? 'Online' : 'Offline'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Mini details */}
                <div className="flex items-center gap-2 shrink-0">
                  {onDeleteChat && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteChatId(currentChat?.id || null)}
                      className="w-9 h-9 flex items-center justify-center bg-transparent border border-nocturnal-border hover:border-red-500/40 text-nocturnal-outline hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-150 cursor-pointer"
                      title="Delete conversation history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 bg-nocturnal-surface-low/60 border border-nocturnal-border/40 rounded-lg p-1 pr-3 max-w-[130px]">
                    {currentChat?.book.cover && (
                      <img
                        src={currentChat.book.cover || null}
                        alt="Cover Mini"
                        className="w-6 h-8 rounded-sm object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] text-on-surface font-medium truncate font-sans">
                        {currentChat?.book.title}
                      </p>
                      <p className="text-[9px] text-primary-lavender font-bold font-sans">
                        {currentChat?.book.price === 0 ? "Free" : `₹${currentChat?.book.price}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Bubble Message Stream */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4 pr-1">
                {currentChat?.messages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                      {msg.isMeetingPoint ? (
                        /* Special meeting point widget mockup component */
                        <div className="max-w-[85%] bg-nocturnal-surface border border-primary-lavender/40 rounded-2xl overflow-hidden shadow-lg hover:scale-[1.01] transition-transform duration-150 relative">
                          {/* Map snip background */}
                          <div className="h-28 w-full relative overflow-hidden bg-nocturnal-surface-low border-b border-nocturnal-border/30">
                            <img
                              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKyjJOBgihHRzYq70q6HeUlHyuIUgVZ0A-zXs1i3GMVVEgdgxBqTqkTgVogwBsxqJtcaHgEenHspH8CljUvNL13D92Jk7P58fTpA-M_XbFuRu6dSnTPJtPSOCg1qu5IFJRO_wGLgq_TuehtfRSLMvtSXp60Gf9UAzuzwZdNkdwLhWJca2IOoBSV8mFtmBc-P3kLLrjdo-7IjN3XOB0l295BihANGOABWWf8mHrf0b9UzlyRbyMgiRMuX61GC8NOhfk0DNbWK6I2_jf"
                              alt="Meeting location map snippet"
                              className="w-full h-full object-cover opacity-50 grayscale contrast-125"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-primary-lavender drop-shadow-[0_0_8px_rgba(211,188,252,0.8)] fill-primary-lavender/30" />
                            </div>
                          </div>

                          {/* Landmark footer */}
                          <div className="p-3.5 flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-primary-lavender/10 border border-primary-lavender/20 flex items-center justify-center text-primary-lavender shrink-0">
                              <Landmark className="w-4 h-4 text-primary-lavender" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-sans font-bold text-on-surface uppercase tracking-wider">
                                Arranged meeting point
                              </p>
                              <p className="text-xs text-nocturnal-outline font-sans font-semibold mt-0.5 leading-none">
                                {msg.meetingLocation}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Standard messages */
                        <div className={`max-w-[85%] overflow-hidden ${
                          isMe ? 'chat-bubble-right bg-primary-lavender p-3 px-4 text-primary-lavender-dark' : 'chat-bubble-left bg-nocturnal-surface-highest p-3 px-4'
                        }`}>
                          {msg.image && (
                            <div className="mb-2 max-w-full rounded-lg overflow-hidden border border-nocturnal-border/20 shadow-md">
                              <img
                                src={msg.image}
                                alt="Sent Condition Detail"
                                referrerPolicy="no-referrer"
                                className="w-full h-auto max-h-44 object-cover cursor-zoom-in hover:scale-[1.01] transition-transform"
                                onClick={() => setZoomedImage(msg.image || null)}
                              />
                            </div>
                          )}
                          {msg.text && (
                            <p className="text-sm font-sans leading-relaxed break-words">
                              {msg.text}
                            </p>
                          )}
                          <div className="flex items-center justify-end gap-1 mt-1.5 select-none">
                            <span className={`text-[9px] font-sans leading-none ${isMe ? 'text-primary-lavender-dark/80 font-semibold' : 'text-nocturnal-outline'}`}>
                              {msg.timestamp.includes(', ') ? msg.timestamp.split(', ')[1] : msg.timestamp}
                            </span>
                            {isMe && renderStatusTick(msg.status)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Input Form Footer */}
              <form onSubmit={handleSend} className="pt-3 border-t border-nocturnal-border/40 shrink-0 relative">
                {/* Photo attachment popover drawer */}
                <AnimatePresence>
                  {isAttachmentOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute bottom-18 left-0 right-0 bg-nocturnal-surface-high border border-nocturnal-border/80 rounded-2xl p-4 shadow-xl z-30 flex flex-col gap-3.5"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-nocturnal-border/30">
                        <span className="text-xs font-serif font-bold text-on-surface">Share book photos</span>
                        <button 
                          type="button" 
                          onClick={() => setIsAttachmentOpen(false)} 
                          className="text-nocturnal-outline hover:text-on-surface transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* File upload option */}
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-3 p-3 bg-nocturnal-surface-low rounded-xl border border-dashed border-nocturnal-border hover:bg-nocturnal-surface-highest transition-colors cursor-pointer text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-lavender/15 flex items-center justify-center text-primary-lavender shrink-0 transition-transform group-hover:scale-110">
                            <Camera className="w-4 h-4 text-primary-lavender" />
                          </div>
                          <div>
                            <p className="text-xs font-sans font-bold text-on-surface">Upload from device</p>
                            <p className="text-[10px] text-nocturnal-outline mt-0.5">Take photo or browse local library</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Attachment Preview Card */}
                {selectedImage && (
                  <div className="flex items-center gap-3 p-2 bg-nocturnal-surface-high border border-nocturnal-border/40 rounded-xl mb-3 relative animate-fadeIn">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-nocturnal-border shrink-0">
                      <img 
                        src={selectedImage} 
                        alt="Preview Attachment" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans font-bold text-on-surface">Photo Attached</p>
                      <p className="text-[10px] text-nocturnal-outline truncate leading-snug">
                        Press send to share this book condition image.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-nocturnal-surface-low border hover:bg-nocturnal-surface-high text-nocturnal-outline hover:text-on-surface active:scale-95 transition-transform cursor-pointer shrink-0 ${isAttachmentOpen ? 'border-primary-lavender text-primary-lavender' : 'border-nocturnal-border/40'}`}
                  >
                    <Image className="w-4.5 h-4.5" />
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
                      className="w-full bg-nocturnal-surface-low border border-nocturnal-border/80 rounded-full py-2.5 px-4 font-sans text-sm text-on-surface focus:outline-none focus:border-primary-lavender placeholder-nocturnal-outline focus:ring-1 focus:ring-primary-lavender/25 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    id="chat-send"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-lavender hover:bg-lavender-container text-primary-lavender-dark shadow-md shadow-primary-lavender/30 active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4 text-primary-lavender-dark stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox zoom overlay modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[999] flex flex-col items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-primary-lavender bg-white/11 hover:bg-white/20 p-2.5 rounded-full transition-all"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={zoomedImage}
              alt="Zoomed book condition detail"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl border border-white/10"
            />
            <p className="text-white/70 text-xs font-sans mt-4 bg-black/40 p-2 rounded-lg backdrop-blur-md">
              Book Detail Photo • Click outer black area to return
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Delete Chat Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteChatId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-sm rounded-2xl bg-nocturnal-surface border border-accent-terracotta/25 shadow-[0_0_50px_rgba(255,181,156,0.08)] p-6 text-on-surface relative overflow-hidden"
            >
              {/* Top soft glowing indicator line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-terracotta via-red-400 to-accent-terracotta" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-100/90 shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-on-surface leading-none">Delete Conversation?</h3>
                  <p className="font-sans text-[10px] text-nocturnal-outline mt-1 font-semibold uppercase tracking-wider">
                    This step is permanent
                  </p>
                </div>
              </div>

              <p className="font-sans text-xs text-nocturnal-outline mt-4 leading-relaxed bg-nocturnal-surface-low p-3.5 rounded-xl border border-nocturnal-border/10">
                Are you sure you want to delete all messages and history from this chat session? This action is permanent and cannot be undone.
              </p>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteChatId(null)}
                  className="flex-1 h-11 rounded-xl bg-nocturnal-surface-low border border-nocturnal-border/60 text-xs font-sans font-bold text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high transition-all cursor-pointer"
                >
                  Keep Chat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteChat) {
                      onDeleteChat(confirmDeleteChatId);
                    }
                    setConfirmDeleteChatId(null);
                  }}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-accent-terracotta-dark hover:from-red-400 hover:to-accent-terracotta text-xs font-sans font-black text-on-surface shadow-lg shadow-red-500/10 transition-all cursor-pointer hover:shadow-red-500/20"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Email Dispatch & Control Hub Drawer */}
      <AnimatePresence>
        {isEmailDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1100] flex justify-end"
            onClick={() => setIsEmailDrawerOpen(false)}
          >
            {/* Drawer Sliding Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-full max-w-sm h-full bg-nocturnal-surface border-l border-nocturnal-border/40 p-6 text-on-surface shadow-[0_0_50px_rgba(139,92,246,0.1)] flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Soft purple top highlight */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-lavender via-violet-400 to-primary-lavender" />

              {/* Header */}
              <div className="flex items-start justify-between mb-6 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary-lavender animate-pulse" />
                    <span className="font-serif text-[10px] font-bold text-primary-lavender uppercase tracking-wider">
                      BookLoop Dispatch Center
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-on-surface mt-1">Notification Outbox</h3>
                  <p className="font-sans text-[11px] text-nocturnal-outline mt-1 leading-relaxed">
                    Verify copies of user trades and messaging signals forwarded directly to reader inboxes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmailDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-nocturnal-surface-low border border-nocturnal-border/60 hover:bg-nocturnal-surface-high flex items-center justify-center text-nocturnal-outline hover:text-on-surface transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                
                {/* Integration Setup Panel */}
                <div className="bg-nocturnal-surface-low border border-nocturnal-border/30 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-sans font-black text-primary-lavender uppercase tracking-wider">
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configuration & Webhooks</span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Setting 1 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-serif text-xs font-bold text-on-surface">Enable Outbound Email Copies</p>
                        <p className="text-[10px] font-sans text-nocturnal-outline">Send copies of all trade messages.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotificationSettings(p => ({ ...p, copyToInbox: !p.copyToInbox }))}
                        className={`w-11 h-6 rounded-full transition-all duration-200 cursor-pointer relative shrink-0 ${
                          notificationSettings.copyToInbox ? 'bg-primary-lavender' : 'bg-nocturnal-border'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                          notificationSettings.copyToInbox ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Setting 2 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-serif text-xs font-bold text-on-surface">Attachment Copy Routing</p>
                        <p className="text-[10px] font-sans text-nocturnal-outline">Attach uploaded images in email copies.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotificationSettings(p => ({ ...p, includeImages: !p.includeImages }))}
                        className={`w-11 h-6 rounded-full transition-all duration-200 cursor-pointer relative shrink-0 ${
                          notificationSettings.includeImages ? 'bg-primary-lavender' : 'bg-nocturnal-border'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                          notificationSettings.includeImages ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Active Destination Center */}
                  <div className="border-t border-nocturnal-border/20 pt-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-sans text-nocturnal-outline font-bold uppercase tracking-wider">Active Verified Host</p>
                      <p className="font-mono text-[10px] text-primary-lavender font-semibold mt-0.5">smtp.bookloop.in (SSL)</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-lg text-emerald-400 font-sans text-[9px] font-black uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online</span>
                    </div>
                  </div>
                </div>

                {/* Diagnostics and Action */}
                <div className="bg-[#2a2444]/10 border border-[#2a2444]/40 rounded-xl p-4">
                  <h4 className="font-serif text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary-lavender" />
                    Test Dispatch Center
                  </h4>
                  <p className="text-[10px] font-sans text-nocturnal-outline mt-1 leading-normal">
                    Trigger a verified test notification copy to see how incoming messaging notifications automatically format, route, and deliver.
                  </p>

                  <div className="mt-3.5 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={testEmailSending}
                      onClick={() => {
                        setTestEmailSending(true);
                        setTestEmailStatus(null);
                        setTimeout(() => {
                          setTestEmailSending(false);
                          setTestEmailStatus("✅ Connection verified! Direct message notification dispatched and checked in to transport mail server successfully.");
                        }, 1200);
                      }}
                      className="h-9 px-4 rounded-lg bg-primary-lavender hover:bg-violet-400 text-xs font-sans font-bold text-white flex items-center gap-1.5 transition-all duration-150 cursor-pointer disabled:opacity-50 select-none shadow-md shadow-primary-lavender/10"
                    >
                      {testEmailSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin animate-infinite" />
                          <span>Testing Carrier...</span>
                        </>
                      ) : (
                        <>
                          <Inbox className="w-3.5 h-3.5" />
                          <span>Send Test Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {testEmailStatus && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-sans text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/15 p-2.5 rounded-lg mt-3"
                    >
                      {testEmailStatus}
                    </motion.div>
                  )}
                </div>

                {/* Logs History Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-sans font-black text-primary-lavender uppercase tracking-wider">
                    <span>📜 Delivery Outbox Log ({emailLogs.length})</span>
                    <span className="text-[9px] text-nocturnal-outline font-sans lowercase">real-time sync</span>
                  </div>

                  {emailLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-nocturnal-border/40 rounded-xl bg-nocturnal-surface-low/30 text-center">
                      <Inbox className="w-8 h-8 text-nocturnal-outline/30 mb-2" />
                      <p className="font-serif text-xs font-bold text-on-surface opacity-80">Outbox list is empty</p>
                      <p className="font-sans text-[10px] text-nocturnal-outline mt-1 px-6 leading-relaxed">
                        No trade notifications have been checked out yet. Once a message is sent or received, they will assemble on the global ledger.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                      {emailLogs.map((log) => (
                        <div
                          key={`log-${log.id}`}
                          className="bg-nocturnal-surface-low border border-nocturnal-border/20 hover:border-nocturnal-border/40 rounded-xl p-3 text-[11px] font-sans relative transition-all duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-xs font-bold text-on-surface">To: {log.recipientName}</span>
                            <span className="text-[9px] text-nocturnal-outline font-semibold">{log.timestamp}</span>
                          </div>
                          
                          <p className="text-[10px] text-primary-lavender mt-0.5 truncate">{log.recipientEmail}</p>

                          <div className="bg-nocturnal-surface/60 border border-nocturnal-border/10 p-2 rounded-lg mt-2 text-[10px] leading-relaxed text-nocturnal-outline font-serif">
                            <div className="font-bold text-on-surface/90 truncate">{log.subject}</div>
                            <div className="text-[9px] font-sans italic truncate mt-1">"{log.messageText}"</div>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="text-[9px] text-nocturnal-outline font-mono">ID: {log.id}</div>
                            <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              <Check className="w-2.5 h-2.5" />
                              <span>Delivered</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* App status footer */}
              <div className="mt-6 border-t border-nocturnal-border/20 pt-4 text-center shrink-0">
                <p className="text-[9px] font-sans text-nocturnal-outline tracking-wider font-semibold">
                  BOOKLOOP SECURE TRANSACTION PLATFORM
                </p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
