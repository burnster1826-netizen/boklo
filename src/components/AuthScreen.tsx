import React, { useState } from 'react';
import { INDIAN_LOCATIONS } from '../data';
import { UserProfile } from '../types';
import { MapPin, Shield, Compass, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const POPULAR_INDIAN_LOCALITIES = [
  "Indiranagar, Bengaluru",
  "Koramangala, Bengaluru",
  "Whitefield, Bengaluru",
  "Jayanagar, Bengaluru",
  "HSR Layout, Bengaluru",
  "Bandra West, Mumbai",
  "Andheri West, Mumbai",
  "Juhu, Mumbai",
  "Hauz Khas, New Delhi",
  "Vasant Kunj, New Delhi",
  "Connaught Place, New Delhi",
  "Rajouri Garden, New Delhi",
  "Salt Lake, Kolkata",
  "Park Street, Kolkata",
  "New Town, Kolkata",
  "Adyar, Chennai",
  "Anna Nagar, Chennai",
  "T. Nagar, Chennai",
  "Banjara Hills, Hyderabad",
  "Jubilee Hills, Hyderabad",
  "Gachibowli, Hyderabad",
  "Koregaon Park, Pune",
  "Kalyani Nagar, Pune",
  "Kothrud, Pune",
  "Vaishali Nagar, Jaipur",
  "Gomti Nagar, Lucknow",
  "Sector 17, Chandigarh",
  "Satellite, Ahmedabad"
];

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [selectedLoc, setSelectedLoc] = useState('Koramangala, Bengaluru');
  const [customLoc, setCustomLoc] = useState('Koramangala, Bengaluru');
  const [isManualLoc, setIsManualLoc] = useState(true);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(POPULAR_INDIAN_LOCALITIES.slice(0, 5));
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  // Debounced API search effect restricting searches strictly to India
  React.useEffect(() => {
    if (!customLoc.trim()) {
      setSuggestions(POPULAR_INDIAN_LOCALITIES.slice(0, 5));
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const queryStr = encodeURIComponent(customLoc);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${queryStr}&countrycodes=in&addressdetails=1&limit=6`, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formattedList = data.map((item: any) => {
              const addr = item.address;
              if (!addr) return item.display_name;
              
              // Parse out specific locations for intuitive, high-quality results
              const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.residential || addr.road || addr.sublocality || "";
              const city = addr.city || addr.town || addr.village || addr.municipality || addr.city_district || addr.county || "";
              const state = addr.state || "";
              
              const parts = [];
              if (area) parts.push(area);
              if (city) parts.push(city);
              if (state) parts.push(state);
              
              const combined = parts.join(', ');
              return combined || item.display_name.split(',').slice(0, 3).join(',').trim();
            });

            const parsedList = Array.from(new Set(formattedList))
              .map(str => str.replace(/, India$/i, '').trim())
              .filter(Boolean);

            setSuggestions(parsedList.slice(0, 6));
          }
        }
      } catch (err) {
        console.error("Indian location auto-suggestions error:", err);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [customLoc]);

  const requestSystemLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
         setLocationStatus('granted');
         const lat = position.coords.latitude;
         const lon = position.coords.longitude;
         
         let detected = "";

         // Attempt 1: Fetch from OpenStreetMap Nominatim reverse geocoding API
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
           console.warn("OSM Geocoding fetch failed, falling back to local database classification:", osmErr);
         }

         // Attempt 2: Local coordinate fallback
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

         setCustomLoc(detected);
         setSelectedLoc(detected);
         setIsManualLoc(true);
      },
      (err) => {
        console.warn("Location permission declined or timed out:", err);
        setLocationStatus('denied');
        setIsManualLoc(true);
        setError("Location request declined or timed out. Please enter your locality manually below.");
      },
      { timeout: 12000 }
    );
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    const finalLocation = isManualLoc && customLoc.trim() 
      ? customLoc.trim() 
      : selectedLoc;

    const provider = new GoogleAuthProvider();
    try {
      const userCred = await signInWithPopup(auth, provider);
      const user = userCred.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let profileData: UserProfile;
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        profileData = {
          ...existingData,
          location: existingData.location || finalLocation,
          email: existingData.email || user.email || '',
        } as UserProfile;
        
        await setDoc(userDocRef, { location: profileData.location, email: profileData.email }, { merge: true });
      } else {
        profileData = {
          name: user.displayName || 'Avid Reader',
          email: user.email || '',
          avatar: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
          location: finalLocation,
          isLocationGranted: locationStatus === 'granted',
          customLocationName: isManualLoc ? customLoc : "",
          rating: 5.0,
          swaps: 0,
          readingPersona: {
            title: "The Curious Journeyman",
            genres: ["Fiction", "Self-Help", "Adventure"]
          },
          likedBookIds: []
        };
        await setDoc(userDocRef, { ...profileData, uid: user.uid });
      }
      onAuthSuccess(profileData);
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message;
      if (err.code === 'auth/popup-closed-by-user') {
        friendlyMessage = "Google sign-in popup was closed before completion.";
      } else if (err.code === 'auth/cancelled-popup-request') {
        friendlyMessage = "Google sign-in request was cancelled. Please try again.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-view" className="min-h-screen bg-nocturnal-bg flex flex-col justify-center px-6 py-12 relative overflow-hidden select-none">
      {/* Starry Night Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_20%,rgba(211,188,252,0.08),transparent_60%)]"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <div className="flex justify-center mb-2">
          <div className="w-16 h-16 rounded-full bg-primary-lavender/10 border border-primary-lavender/30 flex items-center justify-center text-primary-lavender">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <h2 className="text-4xl font-serif font-bold text-primary-lavender tracking-tight">BookLoop</h2>
        <p className="text-sm font-sans text-nocturnal-muted mt-2">
          India's Premier Local Used Book Marketplace
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-nocturnal-surface border border-nocturnal-border/60 py-8 px-6 shadow-2xl rounded-2xl space-y-6">
          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-sm p-3 rounded-lg text-center font-sans">
              {error}
            </div>
          )}

          {/* LOCATION PERMISSION & WRITTEN INPUT SECTION */}
          <div className="bg-nocturnal-surface-low border border-nocturnal-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-on-surface flex items-center gap-2 font-sans uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-primary-lavender" /> LOCATION SETTING
                </h4>
                <p className="text-[11px] text-nocturnal-outline mt-0.5 font-sans leading-relaxed">
                  BookLoop connects readers within close circles of Indian localities.
                </p>
              </div>
            </div>

            {/* Geo location trigger */}
            <button
              type="button"
              onClick={requestSystemLocation}
              className="w-full py-2.5 px-4 rounded-lg border border-primary-lavender/30 bg-primary-lavender/10 hover:bg-primary-lavender/15 text-primary-lavender text-xs font-bold font-sans flex items-center justify-center gap-2 transition-colors duration-150 cursor-pointer"
            >
              {locationStatus === 'requesting' ? (
                <div className="w-4 h-4 border-2 border-primary-lavender border-t-transparent rounded-full animate-spin"></div>
              ) : locationStatus === 'granted' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Permission Granted ({customLoc.split(',')[0]})
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  Request Location Permission
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-nocturnal-border/40"></div>
              <span className="text-[10px] text-nocturnal-outline font-sans uppercase">Or Type manually</span>
              <div className="flex-1 h-px bg-nocturnal-border/40"></div>
            </div>

            {/* Manual Selection or Custom Written Input */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  required
                  value={customLoc}
                  onChange={(e) => {
                    setCustomLoc(e.target.value);
                    setSelectedLoc(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Type your area (e.g. Indiranagar, Bengaluru)"
                  className="w-full h-10 px-3 bg-nocturnal-surface-lowest border border-nocturnal-border rounded-lg text-on-surface font-sans text-xs placeholder-nocturnal-outline outline-none focus:border-primary-lavender focus:ring-1 focus:ring-primary-lavender/45 transition-all font-medium animate-none"
                />
                
                {/* Suggestions List */}
                {showSuggestions && (isFetchingSuggestions || suggestions.length > 0) && (
                  <div className="absolute left-0 right-0 z-50 mt-1.5 bg-nocturnal-surface border border-nocturnal-border rounded-xl shadow-2xl py-1 overflow-hidden pointer-events-auto max-h-48 overflow-y-auto">
                    {isFetchingSuggestions && (
                      <div className="px-3.5 py-2.5 text-nocturnal-outline text-[11px] font-sans flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-primary-lavender border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching cities in India...</span>
                      </div>
                    )}
                    
                    {!isFetchingSuggestions && suggestions.map((loc) => (
                      <div
                        key={loc}
                        onMouseDown={() => {
                          setCustomLoc(loc);
                          setSelectedLoc(loc);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-primary-lavender/15 text-on-surface font-sans text-xs flex items-center gap-2 cursor-pointer transition-colors border-b border-nocturnal-border/20 last:border-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary-lavender shrink-0" />
                        <span>{loc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-nocturnal-border/30"></div>
            <span className="flex-shrink mx-4 text-nocturnal-outline text-[10px] font-sans uppercase tracking-widest font-medium">Verify Identity</span>
            <div className="flex-grow border-t border-nocturnal-border/30"></div>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 bg-white hover:bg-neutral-100 text-neutral-900 font-sans font-bold text-sm rounded-xl transition-all duration-150 shrink-0 flex items-center justify-center gap-3 shadow-lg shadow-black/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" id="google-g">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-.1 1.5.28-1.5-.78 1.15-2 1.95-3.37 2.4v2h5.5c3.2-2.95 5.07-7.3 5.07-12.73z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.9l-5.5-4.27c-1.52 1.02-3.47 1.63-5.63 1.63-4.34 0-8.02-2.93-9.33-6.87h-5.7v4.4C4.16 20.3 7.85 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M2.67 11.6c-.33-.97-.52-2-.52-3.1s.2-2.13.52-3.1v-4.4h-5.7C1.48 2.94 0 5.3 0 8s1.48 5.06 4.17 7.1l5.7-4.4c-1.3-.94-2.22-2.07-2.67-3.1H2.67z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.43-3.43C17.95 1.12 15.24 0 12 0 7.85 0 4.16 3.7 2.17 7.1l5.7 4.4c1.3-3.94 4.99-6.87 9.13-6.87z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-nocturnal-outline pt-2">
            <Shield className="w-3.5 h-3.5 text-primary-lavender" /> Fully secure, India-exclusive peer-to-peer system
          </div>
        </div>
      </motion.div>
    </div>
  );
}
