import React, { useState, useRef } from 'react';
import { UserProfile, Book } from '../types';
import { Settings, Award, Edit3, Shield, RotateCcw, Sparkles, BookOpen, LogOut, MapPin, CheckCircle, Save, Camera, Upload, X, Check, Heart, Copy, Smartphone, QrCode, ExternalLink, Compass, Mail, Clock, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailNotification } from '../lib/emailService';

const CURATED_AVATARS = [
  {
    name: 'Modern Poet',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Classic Scholar',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Sci-Fi Dreamer',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Indie Novelist',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Mystery Searcher',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
  },
  {
    name: 'Cozy Bibliophile',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  }
];

const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Define maximum dimensions (e.g. 150x150)
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed jpeg with 0.82 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string || '');
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

interface ProfileScreenProps {
  user: UserProfile;
  userListedBooks: Book[];
  allBooks: Book[];
  onSelectBook: (book: Book) => void;
  onSignOut: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  emailLogs?: EmailNotification[];
}

export default function ProfileScreen({
  user,
  userListedBooks,
  allBooks,
  onSelectBook,
  onSignOut,
  onUpdateProfile,
  emailLogs = []
}: ProfileScreenProps) {
  const [activeBookTab, setActiveBookTab] = useState<'listed' | 'favorites'>('listed');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editLoc, setEditLoc] = useState(user.location);
  const [editPersona, setEditPersona] = useState(user.readingPersona.title);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectionError, setDetectionError] = useState('');

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Donation states
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donationType, setDonationType] = useState<'pocket' | 'book' | 'scholar'>('pocket');
  const [donationAmount, setDonationAmount] = useState('50');
  const [customDonationAmount, setCustomDonationAmount] = useState('');
  const [donationBooksCount, setDonationBooksCount] = useState('3');
  const [donorName, setDonorName] = useState(user.name);
  const [donorMessage, setDonorMessage] = useState('');
  const [donationStep, setDonationStep] = useState<'options' | 'upi' | 'processing' | 'success'>('options');
  const [isUpiCopied, setIsUpiCopied] = useState(false);
  const [isAmtCopied, setIsAmtCopied] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePhotoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFileError('Please drop/upload a valid image file (PNG/JPEG/WebP)');
      return;
    }
    setIsUploading(true);
    setFileError('');
    try {
      const base64Url = await resizeAndCompressImage(file);
      onUpdateProfile({ avatar: base64Url });
      setIsPhotoModalOpen(false);
    } catch (err: any) {
      setFileError(err.message || 'Error processing your image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handlePhotoFile(files[0]);
    }
  };

  const selectStockAvatar = (url: string) => {
    onUpdateProfile({ avatar: url });
    setIsPhotoModalOpen(false);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onUpdateProfile({ avatar: customUrl.trim() });
      setIsPhotoModalOpen(false);
      setCustomUrl('');
    }
  };

  const handleSave = () => {
    onUpdateProfile({
      name: editName.trim() || user.name,
      location: editLoc.trim() || user.location
    });
    setIsEditing(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setDetectionError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setDetectionError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        let detected = "";

        // Reverse geocoding via OpenStreetMap Nominatim
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`, {
            headers: {
              'Accept-Language': 'en'
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const addr = data.address;
              const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.road || addr.sublocality || "";
              const city = addr.city || addr.town || addr.village || addr.municipality || addr.city_district || addr.county || addr.state_district || "";
              
              if (area && city) {
                detected = `${area}, ${city}`;
              } else if (city) {
                detected = city;
              } else if (data.display_name) {
                detected = data.display_name.split(',').slice(0, 2).join(',').trim();
              }
            }
          }
        } catch (osmErr) {
          console.warn("OSM Geocoding fetch failed, falling back to coordinate checks:", osmErr);
        }

        if (!detected) {
          if (lat >= 12.0 && lat <= 13.5 && lon >= 77.0 && lon <= 78.0) {
            detected = "Indiranagar, Bengaluru";
          } else if (lat >= 18.5 && lat <= 19.5 && lon >= 72.5 && lon <= 73.5) {
            detected = "Bandra West, Mumbai";
          } else if (lat >= 22.0 && lat <= 23.0 && lon >= 88.0 && lon <= 89.0) {
            detected = "Salt Lake, Kolkata";
          } else if (lat >= 12.8 && lat <= 13.2 && lon >= 80.0 && lon <= 80.5) {
            detected = "Adyar, Chennai";
          } else {
            detected = "Vasant Kunj, New Delhi";
          }
        }

        detected = detected.replace(/, India$/i, '').trim();
        setEditLoc(detected);
        setDetectingLocation(false);
      },
      (err) => {
        console.warn("Location permission declined or timed out:", err);
        setDetectionError("Declined or timed out. Use manual input.");
        setDetectingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Header action panel */}
      <div className="flex items-center justify-between shrink-0">
        <h3 className="font-serif text-lg font-bold text-primary-lavender">
          Curated Profile
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-full bg-nocturnal-surface-low border border-nocturnal-border/40 hover:bg-nocturnal-surface-high transition-colors active:scale-90 text-on-surface hover:text-primary-lavender cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={onSignOut}
            className="p-2 rounded-full bg-nocturnal-surface-low border border-nocturnal-border/40 hover:bg-nocturnal-surface-high text-red-400 hover:text-white transition-colors active:scale-95 cursor-pointer"
            title="Reset library card"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Avatar & Stats Dashboard (Takes 5 spans) */}
        <div className="md:col-span-5 space-y-6">
          {/* Profile Info Center matching mockup */}
          <div className="flex flex-col items-center text-center space-y-3.5 bg-nocturnal-surface/30 border border-nocturnal-border/30 rounded-2xl p-6 shadow-sm">
            {isEditing ? (
              <div className="relative flex flex-col items-center">
                <div 
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="relative group cursor-pointer"
                  title="Change custom profile photo"
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary-lavender bg-nocturnal-surface-lowest shadow-xl">
                    <img
                      src={user.avatar || null}
                      alt={user.name || "User Avatar"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-200">
                      <Camera className="w-5 h-5 text-primary-lavender" />
                      <span className="text-[10px] text-primary-lavender font-bold mt-1 uppercase tracking-wider">Change</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-lavender/20 border border-primary-lavender text-primary-lavender flex items-center justify-center shadow-lg backdrop-blur">
                    <Camera className="w-3.5 h-3.5 text-primary-lavender" />
                  </div>
                </div>
                
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-primary-lavender hover:text-primary-lavender/80 cursor-pointer flex items-center gap-1.5 mt-2.5 transition-colors"
                >
                  <Upload className="w-3 h-3" /> Change Photo
                </button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={user.avatar || null}
                  alt={user.name || "User Avatar"}
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary-lavender shadow-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-lavender/30 border border-primary-lavender text-primary-lavender flex items-center justify-center shadow-lg backdrop-blur animate-pulse">
                  <Award className="w-4 h-4 text-primary-lavender" />
                </div>
              </div>
            )}

            {isEditing ? (
              <div className="w-full max-w-xs space-y-3 bg-nocturnal-surface-low border border-nocturnal-border p-4 rounded-xl text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-sans text-nocturnal-outline tracking-wider font-semibold">Reader Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-9 px-2 bg-nocturnal-surface border border-nocturnal-border rounded text-xs text-on-surface outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-sans text-nocturnal-outline tracking-wider font-semibold flex items-center justify-between">
                    <span>Location Area</span>
                    {detectionError && (
                      <span className="text-[9px] text-red-400 normal-case font-normal">{detectionError}</span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editLoc}
                      onChange={(e) => setEditLoc(e.target.value)}
                      className="flex-1 h-9 px-2.5 bg-nocturnal-surface border border-nocturnal-border rounded-lg text-xs text-on-surface outline-none focus:border-primary-lavender"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLocation}
                      className="px-3 bg-nocturnal-surface-low border border-nocturnal-border hover:bg-nocturnal-surface-high disabled:opacity-50 text-primary-lavender hover:text-primary-lavender/80 rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 transition-all outline-none"
                      title="Auto-detect current locality"
                    >
                      {detectingLocation ? (
                        <span className="w-3.5 h-3.5 border-2 border-primary-lavender border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Compass className="w-3.5 h-3.5" />
                      )}
                      <span>Detect</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full py-2 bg-primary-lavender text-primary-lavender-dark text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-1 flex flex-col items-center">
                <h2 className="font-serif text-xl font-bold text-on-surface">
                  {user.name}
                </h2>
                <p className="text-xs font-sans text-nocturnal-outline flex items-center justify-center gap-1.5 leading-none">
                  <MapPin className="w-3.5 h-3.5 text-primary-lavender shrink-0" /> {user.location}
                </p>
              </div>
            )}
          </div>

          {/* Used Book Seller Dashboard Metric Stats Box */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-nocturnal-surface border border-nocturnal-border/40 hover:border-nocturnal-border/80 rounded-2xl p-4 text-center transition-all duration-200">
              <p className="font-serif text-xl font-bold text-primary-lavender">
                {user.swaps}
              </p>
              <p className="text-[9px] font-sans text-nocturnal-outline uppercase tracking-wider mt-0.5">
                Sold
              </p>
            </div>
            <div className="bg-nocturnal-surface border border-nocturnal-border/40 hover:border-nocturnal-border/80 rounded-2xl p-4 text-center transition-all duration-200">
              <p className="font-serif text-sm sm:text-xl font-bold text-primary-lavender truncate leading-7">
                {user.swaps === 0 ? "No Rating" : `⭐ ${user.rating}`}
              </p>
              <p className="text-[9px] font-sans text-nocturnal-outline uppercase tracking-wider mt-0.5">
                Rating
              </p>
            </div>
            <div className="bg-nocturnal-surface border border-nocturnal-border/40 hover:border-nocturnal-border/80 rounded-2xl p-4 text-center transition-all duration-200">
              <p className="font-serif text-xl font-bold text-primary-lavender">
                {userListedBooks.length}
              </p>
              <p className="text-[9px] font-sans text-nocturnal-outline uppercase tracking-wider mt-0.5">
                Active
              </p>
            </div>
          </div>

          {/* Styled Action lists cta */}
          <div className="space-y-2.5 pt-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="w-full h-12 bg-primary-lavender hover:bg-lavender-container text-primary-lavender-dark font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 fill-primary-lavender-dark" /> Edit Profile
            </button>
            <button 
              onClick={() => setIsDonationModalOpen(true)}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-nocturnal-bg font-sans font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-nocturnal-bg" /> Donate to BookLoop
            </button>
          </div>

          {/* Delivery Logs Dashboard section */}
          <div className="bg-nocturnal-surface-low border border-nocturnal-border/40 hover:border-nocturnal-border/80 rounded-2xl p-4 mt-1 text-left transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary-lavender/10 border border-primary-lavender/25 flex items-center justify-center text-primary-lavender">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="font-serif text-xs font-bold text-on-surface">📬 Mail Forward Logs</h4>
                <p className="text-[9px] font-sans text-nocturnal-outline">Message triggers history</p>
              </div>
            </div>

            {emailLogs.length === 0 ? (
              <div className="text-center py-5 border border-dashed border-nocturnal-border/20 rounded-xl bg-nocturnal-surface/30">
                <Inbox className="w-5 h-5 text-nocturnal-outline/35 mx-auto mb-1" />
                <p className="text-[10px] font-sans font-bold text-nocturnal-outline leading-none">No logs dispatched</p>
                <p className="text-[9px] font-sans text-nocturnal-outline/80 mt-1 px-3 leading-normal">
                  Trade updates sent live will register here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
                {emailLogs.slice(0, 5).map((log) => (
                  <div
                    key={`profile-log-${log.id}`}
                    className="bg-nocturnal-surface/60 border border-nocturnal-border/10 rounded-xl p-2.5 text-[10px] font-sans relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-on-surface truncate pr-2 max-w-[100px]">To: {log.recipientName}</span>
                      <span className="text-[8px] text-nocturnal-outline font-semibold">{log.timestamp}</span>
                    </div>
                    <p className="text-[9px] text-primary-lavender mt-0.5 truncate">{log.recipientEmail}</p>
                    
                    <div className="bg-nocturnal-surface-low/50 border border-nocturnal-border/5 p-1.5 rounded-lg mt-1.5 font-sans italic truncate text-nocturnal-outline text-[9px]">
                      "{log.messageText}"
                    </div>

                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-mono text-[8px] text-nocturnal-outline">{log.id.split('-').slice(0, 2).join('-')}</span>
                      <span className="flex items-center gap-0.5 text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded">
                        <Check className="w-2 h-2" />
                        <span>Sent</span>
                      </span>
                    </div>
                  </div>
                ))}
                {emailLogs.length > 5 && (
                  <p className="text-center text-[8px] font-sans text-nocturnal-outline mt-2 font-semibold block uppercase tracking-wider">
                    + {emailLogs.length - 5} more logs in messages outbox
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Persona Profile, Library Catalog & Feed logs (Takes 7 spans) */}
        <div className="md:col-span-7 space-y-6">
          {/* My Curated Library books horizontally scrolled list with Favorites toggle */}
          {(() => {
            const favoritedBooks = allBooks.filter((b) => user.likedBookIds.includes(b.id));
            const displayedBooks = activeBookTab === 'listed' ? userListedBooks : favoritedBooks;

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-nocturnal-border/40 pb-2">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveBookTab('listed')}
                      className={`font-serif text-base font-bold transition-all relative pb-2 cursor-pointer ${
                        activeBookTab === 'listed'
                          ? 'text-primary-lavender'
                          : 'text-nocturnal-outline hover:text-on-surface'
                      }`}
                    >
                      Listed Books ({userListedBooks.length})
                      {activeBookTab === 'listed' && (
                        <motion.div
                          layoutId="activeLibraryTabLine"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-lavender rounded-full"
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBookTab('favorites')}
                      className={`font-serif text-base font-bold transition-all relative pb-2 cursor-pointer flex items-center gap-1.5 ${
                        activeBookTab === 'favorites'
                          ? 'text-primary-lavender'
                          : 'text-nocturnal-outline hover:text-on-surface'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${activeBookTab === 'favorites' ? 'fill-primary-lavender stroke-primary-lavender' : ''}`} />
                      My Favorites ({favoritedBooks.length})
                      {activeBookTab === 'favorites' && (
                        <motion.div
                          layoutId="activeLibraryTabLine"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-lavender rounded-full"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {displayedBooks.length === 0 ? (
                  <div className="bg-nocturnal-surface-low border border-dashed border-nocturnal-border/80 rounded-2xl py-8 px-4 text-center">
                    <BookOpen className="w-8 h-8 text-nocturnal-outline mx-auto stroke-1 mb-2 animate-pulse" />
                    <p className="text-xs font-sans text-nocturnal-outline">
                      {activeBookTab === 'listed'
                        ? 'No books listed yet. Listed copies will appear here.'
                        : 'No favorite books added yet. Tap the heart icon in Discover tab!'}
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                    {displayedBooks.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="w-28 shrink-0 space-y-2 group text-left cursor-pointer focus:outline-none"
                      >
                        <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-nocturnal-surface-lowest border border-nocturnal-border/50 relative">
                          <img
                            src={book.images?.[0] || null}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-xl"></div>
                        </div>
                        <div className="min-w-0 px-0.5">
                          <p className="text-xs font-serif font-bold text-on-surface truncate group-hover:text-primary-lavender transition-colors">
                            {book.title}
                          </p>
                          <p className="text-[10px] font-sans text-primary-lavender font-bold mt-0.5">
                            {book.price === 0 ? 'Free' : `₹${book.price}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}


        </div>
      </div>

      {/* Small secure privacy credit note */}
      <p className="text-[10px] text-center text-nocturnal-outline font-sans flex items-center justify-center gap-1.5 pt-4">
        <Shield className="w-3.5 h-3.5 text-primary-lavender" /> BookLoop Privacy Policy Protected Book Circles
      </p>

      {/* UPDATE PROFILE PHOTO MODAL OVERLAY */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-nocturnal-surface border border-nocturnal-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative animate-fadeIn"
            >
              <div className="p-5 border-b border-nocturnal-border/40 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg font-black text-on-surface flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary-lavender" /> Update Profile Photo
                  </h4>
                  <p className="text-[11px] font-sans text-nocturnal-outline mt-0.5">
                    Customize your digital bookmark identity
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    setFileError('');
                  }}
                  className="w-8 h-8 rounded-full bg-nocturnal-surface-low hover:bg-nocturnal-surface-high border border-nocturnal-border/40 hover:text-on-surface text-nocturnal-outline flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Drag and Drop / Upload Section */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-sans font-semibold tracking-wider text-nocturnal-outline">
                    Upload Custom Photo
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                      isDragging 
                        ? 'border-primary-lavender bg-primary-lavender/5 scale-[1.01]' 
                        : 'border-nocturnal-border hover:border-primary-lavender/55 hover:bg-nocturnal-surface-low/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoFile(file);
                      }}
                    />
                    
                    <div className="w-10 h-10 rounded-full bg-primary-lavender/10 border border-primary-lavender/25 text-primary-lavender flex items-center justify-center mb-2.5">
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-primary-lavender border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    
                    <p className="text-xs font-semibold text-on-surface">
                      Drag & drop your photo here, or <span className="text-primary-lavender underline">browse</span>
                    </p>
                    <p className="text-[10px] text-nocturnal-outline mt-1 leading-relaxed">
                      Supports PNG, JPG, or WebP. Auto-optimized & compressed.
                    </p>
                  </div>
                  
                  {fileError && (
                    <p className="text-[11px] font-semibold text-red-400 font-sans mt-1">
                      ⚠️ {fileError}
                    </p>
                  )}
                </div>

                {/* Grid of Stock Pre-designed Avatars */}
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase font-sans font-semibold tracking-wider text-nocturnal-outline">
                    Or Choose themed Reader Persona
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {CURATED_AVATARS.map((avatarItem) => {
                      const isSelected = user.avatar === avatarItem.url;
                      return (
                        <button
                          key={avatarItem.name}
                          type="button"
                          onClick={() => selectStockAvatar(avatarItem.url)}
                          className="relative aspect-square rounded-full overflow-hidden border-2 cursor-pointer group transition-all duration-155 active:scale-95"
                          style={{
                            borderColor: isSelected ? 'var(--color-primary-lavender, #b39ddb)' : 'transparent'
                          }}
                          title={avatarItem.name}
                        >
                          <img
                            src={avatarItem.url}
                            alt={avatarItem.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary-lavender/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-lavender drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Option 3: Custom Paste URL Link */}
                <form onSubmit={handleCustomUrlSubmit} className="space-y-2.5">
                  <label className="text-[10px] uppercase font-sans font-semibold tracking-wider text-nocturnal-outline">
                    Or Paste Remote Image Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 h-9 px-3 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-xs text-on-surface placeholder-nocturnal-outline outline-none focus:border-primary-lavender"
                    />
                    <button
                      type="submit"
                      disabled={!customUrl.trim()}
                      className="h-9 px-4 rounded-xl bg-primary-lavender hover:bg-primary-lavender/90 disabled:opacity-50 text-primary-lavender-dark text-xs font-bold font-sans transition-colors cursor-pointer shrink-0"
                    >
                      Apply Link
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="p-4 bg-nocturnal-surface-low/55 border-t border-nocturnal-border/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 bg-nocturnal-surface border border-nocturnal-border hover:bg-nocturnal-surface-high font-sans text-xs font-semibold rounded-lg text-nocturnal-outline hover:text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPDATE DONATION / COMMUNITY CONTRIBUTION MODAL */}
      <AnimatePresence>
        {isDonationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="bg-nocturnal-surface border border-nocturnal-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-5 border-b border-nocturnal-border/40 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg font-black text-on-surface flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400 fill-red-400" /> BookLoop Community Care
                  </h4>
                  <p className="text-[11px] font-sans text-nocturnal-outline mt-0.5">
                    Sponsor digital hosting loops to support BookLoop
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDonationModalOpen(false);
                    setDonationStep('options');
                  }}
                  className="w-8 h-8 rounded-full bg-nocturnal-surface-low hover:bg-nocturnal-surface-high border border-nocturnal-border/40 hover:text-on-surface text-nocturnal-outline flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps Renders */}
              {donationStep === 'options' && (
                <div className="p-5 space-y-5 flex flex-col justify-between">
                  {/* Direct Tip / Support form container */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-semibold tracking-wider text-nocturnal-outline">
                        Sponsor Digital Server Space (INR)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Novel Core', value: '50', desc: 'Sponsor list server' },
                          { label: 'Anthology', value: '100', desc: 'Regional loops' },
                          { label: 'Epic Library', value: '500', desc: 'Statewide scale' }
                        ].map((tier) => (
                          <button
                            key={tier.value}
                            type="button"
                            onClick={() => {
                              setDonationAmount(tier.value);
                              setCustomDonationAmount('');
                            }}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center ${
                              donationAmount === tier.value && !customDonationAmount
                                ? 'border-primary-lavender bg-primary-lavender/5 shadow shadow-primary-lavender/10'
                                : 'border-nocturnal-border/60 hover:border-nocturnal-outline'
                            }`}
                          >
                            <span className="text-xs font-bold text-on-surface font-sans">₹{tier.value}</span>
                            <span className="text-[10px] text-primary-lavender font-bold mt-1">{tier.label}</span>
                            <span className="text-[8px] text-nocturnal-outline mt-0.5 leading-snug">{tier.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-sans font-semibold tracking-wider text-nocturnal-outline">
                        Or Enter Custom Tip
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-nocturnal-outline font-bold">₹</span>
                        <input
                          type="number"
                          min="10"
                          placeholder="Other amount..."
                          value={customDonationAmount}
                          onChange={(e) => {
                            setCustomDonationAmount(e.target.value);
                            setDonationAmount(e.target.value);
                          }}
                          className="w-full h-10 pl-7 pr-3 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-xs text-on-surface outline-none focus:border-primary-lavender"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dedication and Name information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-nocturnal-border/30">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-sans font-semibold tracking-wider text-nocturnal-outline">
                        Sponsor / Donor Name
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Your name or Anonymous"
                        className="w-full h-10 px-3 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-xs text-on-surface outline-none focus:border-primary-lavender"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-sans font-semibold tracking-wider text-nocturnal-outline">
                        Loop Dedication Message (Optional)
                      </label>
                      <input
                        type="text"
                        value={donorMessage}
                        onChange={(e) => setDonorMessage(e.target.value)}
                        placeholder="e.g. Keep sharing stories!"
                        className="w-full h-10 px-3 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-xs text-on-surface outline-none focus:border-primary-lavender"
                      />
                    </div>
                  </div>

                  {/* Submission and Close controls */}
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDonationModalOpen(false)}
                      className="flex-1 py-3 bg-nocturnal-surface-low hover:bg-nocturnal-surface-high border border-nocturnal-border/50 text-nocturnal-outline hover:text-on-surface font-sans font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      Close Window
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDonationStep('upi');
                      }}
                      className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-300 text-nocturnal-bg font-sans font-black text-xs rounded-xl active:scale-[0.98] transition-all shadow shadow-emerald-400/10 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-nocturnal-bg" /> Proceed to UPI Payment
                    </button>
                  </div>
                </div>
              )}

              {/* UPI Interactive Step Renderer */}
              {donationStep === 'upi' && (
                <div className="p-5 space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] uppercase font-sans tracking-widest font-black text-primary-lavender bg-primary-lavender/10 px-2.5 py-1 rounded-full">
                      🇮🇳 Unified Payments Interface Enabled
                    </span>
                    <h5 className="font-serif text-base font-black text-on-surface pt-1.5">
                      Scan QR Code or Open UPI App
                    </h5>
                    <p className="text-xs text-nocturnal-outline font-sans max-w-xs mx-auto leading-relaxed">
                      Complete your community sponsorship amount of <span className="text-emerald-400 font-extrabold font-mono">₹{donationAmount || '50'}</span> securely.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Generative QR Area */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="bg-white p-3 rounded-xl shadow-xl border border-nocturnal-border/10 relative group">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180&data=${encodeURIComponent(
                            `upi://pay?pa=prashant5494@slc&pn=BookLoop%20Library&am=${donationAmount || '50'}&cu=INR&tn=${encodeURIComponent(
                              'Support from ' + (donorName || 'Anonymous')
                            )}`
                          )}`}
                          alt="BookLoop Donation UPI QR"
                          className="w-36 h-36 object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 border-2 border-emerald-400/20 rounded-xl pointer-events-none group-hover:border-emerald-400/80 transition-colors" />
                      </div>
                      <span className="text-[9px] font-sans font-bold text-nocturnal-outline uppercase tracking-wider mt-2.5 flex items-center gap-1">
                        <QrCode className="w-3 h-3 text-primary-lavender" /> Scan with GPay, PhonePe, Paytm
                      </span>
                    </div>

                    {/* VPA Details, Copy fields and App Launchers */}
                    <div className="md:col-span-7 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-sans font-bold uppercase tracking-wider text-nocturnal-outline">
                          Official UPI VPA ID
                        </label>
                        <div className="flex items-center bg-nocturnal-surface-lowest border border-nocturnal-border/60 rounded-xl p-2.5 h-10 justify-between">
                          <code className="text-xs font-mono text-primary-lavender font-semibold">prashant5494@slc</code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText('prashant5494@slc');
                              setIsUpiCopied(true);
                              setTimeout(() => setIsUpiCopied(false), 2000);
                            }}
                            className="text-nocturnal-outline hover:text-on-surface p-1 transition-colors cursor-pointer"
                            title="Copy UPI Address"
                          >
                            {isUpiCopied ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-sans font-bold uppercase tracking-wider text-nocturnal-outline">
                          Exact Transfer Amount
                        </label>
                        <div className="flex items-center bg-nocturnal-surface-lowest border border-nocturnal-border/60 rounded-xl p-2.5 h-10 justify-between">
                          <code className="text-xs font-mono font-black text-on-surface">₹{donationAmount || '50'}</code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(donationAmount || '50');
                              setIsAmtCopied(true);
                              setTimeout(() => setIsAmtCopied(false), 2000);
                            }}
                            className="text-nocturnal-outline hover:text-on-surface p-1 transition-colors cursor-pointer"
                            title="Copy Amount"
                          >
                            {isAmtCopied ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Deep Link launching on Mobile platforms. Fallback to web link inside live browsers */}
                      <a
                        href={`upi://pay?pa=prashant5494@slc&pn=BookLoop%20Library&am=${donationAmount || '50'}&cu=INR&tn=${encodeURIComponent(
                          'Support from ' + (donorName || 'Anonymous')
                        )}`}
                        className="w-full h-11 bg-nocturnal-surface-lowest hover:bg-nocturnal-surface-low border border-primary-lavender/30 hover:border-primary-lavender/70 rounded-xl flex items-center justify-center gap-2 text-xs font-bold font-sans text-primary-lavender transition-all cursor-pointer group active:scale-[0.99]"
                      >
                        <Smartphone className="w-4 h-4 text-primary-lavender" />
                        <span>Pay via App (Phone/Mobile)</span>
                        <ExternalLink className="w-3 h-3 text-primary-lavender/65 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3 border-t border-nocturnal-border/30">
                    <button
                      type="button"
                      onClick={() => setDonationStep('options')}
                      className="px-4 py-3 bg-nocturnal-surface-low hover:bg-nocturnal-surface-high border border-nocturnal-border/65 text-nocturnal-outline hover:text-on-surface font-sans font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Change Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDonationStep('processing');
                        setTimeout(() => {
                          setDonationStep('success');
                        }, 2000);
                      }}
                      className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-300 text-nocturnal-bg font-sans font-black text-xs rounded-xl active:scale-[0.98] transition-all shadow-md shadow-emerald-400/10 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-nocturnal-bg" /> I Have Completed The Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Processing Flow Renderer */}
              {donationStep === 'processing' && (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-5">
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-full bg-emerald-500/15 animate-ping" />
                    <div className="w-14 h-14 rounded-full border border-emerald-500/20 bg-nocturnal-surface-lowest flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h5 className="font-serif text-base font-bold text-on-surface">
                      Establishing Micro-Sponsorship Loop
                    </h5>
                    <p className="text-xs text-nocturnal-outline font-sans leading-relaxed max-w-xs mx-auto">
                      Connecting with BookLoop's regional library repository gateway database...
                    </p>
                  </div>
                  <div className="font-mono text-[9px] text-emerald-400/80 bg-nocturnal-surface-low border border-nocturnal-border/40 px-3 py-1.5 rounded-lg select-all uppercase tracking-wider">
                    SECURE_PIN: LOOP_{Math.floor(Math.random() * 90000) + 10000} // SECURE
                  </div>
                </div>
              )}

              {/* Success Flow Renderer */}
              {donationStep === 'success' && (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-400 flex items-center justify-center text-nocturnal-bg shadow-lg shadow-emerald-400/20">
                    <Check className="w-7 h-7 stroke-[3px]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-serif text-lg font-black text-on-surface">
                      Thank You, {donorName || 'Awesome Bookworm'}!
                    </h5>
                    <p className="text-xs text-on-surface/90 font-sans leading-relaxed max-w-xs mx-auto">
                      Your generous support keeps BookLoop's neighborhood book sharing shelves running perfectly.
                    </p>
                  </div>

                  <div className="bg-nocturnal-surface-low/85 border border-nocturnal-border/50 p-4 rounded-xl text-left w-full space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-nocturnal-outline">
                      <span>Contribution Category</span>
                      <strong className="text-on-surface font-semibold capitalize">
                        {donationType === 'pocket' ? 'Hosting Micro-Tip' : donationType === 'book' ? 'Physical Gift' : 'School Textbook Kit'}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-nocturnal-outline">
                      <span>Details / Quantity</span>
                      <strong className="text-primary-lavender font-bold">
                        {donationType === 'book' ? donationBooksCount : `₹${donationAmount || '50'}`}
                      </strong>
                    </div>
                    {donorMessage && (
                      <div className="border-t border-nocturnal-border/20 pt-1.5 mt-1 text-[11px] text-nocturnal-outline italic">
                        "{donorMessage}"
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDonationModalOpen(false);
                      setDonationStep('options');
                    }}
                    className="w-full py-2.5 bg-primary-lavender text-primary-lavender-dark font-sans font-bold text-xs rounded-xl active:scale-95 hover:bg-primary-lavender/95 transition-all shadow shadow-primary-lavender/10 cursor-pointer"
                  >
                    Return to Library Card
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
