import React, { useState, useRef } from 'react';
import { Book, UserProfile } from '../types';
import { Image, Camera, MapPin, CheckCircle, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ListBookScreenProps {
  user: UserProfile;
  onPostListing: (newBook: Omit<Book, 'id' | 'distance' | 'createdAt' | 'seller'>) => void;
  onLocationUpdate: (newLoc: string) => void;
}

const CATEGORIES = ["Fiction", "Non-Fiction", "Sci-Fi", "Philosophy", "Poetry", "Mystery", "Biography", "School Book"];

export default function ListBookScreen({ user, onPostListing, onLocationUpdate }: ListBookScreenProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fiction');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'Like New' | 'Very Good' | 'Well-Loved'>('Like New');
  const [conditionDetails, setConditionDetails] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualLoc, setManualLoc] = useState(user.location);
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64Str: string, maxWidth = 600, maxHeight = 600): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG with 0.7 quality to guarantee compact files
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const urlPromises = filesArray.map((file: File) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const rawBase64 = reader.result as string;
            compressImage(rawBase64).then(resolve);
          };
          reader.readAsDataURL(file as Blob);
        });
      });

      Promise.all(urlPromises).then(base64Urls => {
        setImages(prev => {
          const combined = [...prev, ...base64Urls];
          return combined.slice(0, 5); // caps at 5 shots
        });
      });
    }
  };

  const removeImage = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !price) {
      alert('Please fill out Title, Author, and Price.');
      return;
    }

    // Default stock imagery fallback if none uploaded
    const bookCoversFallback = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLh7Fy4Wx9U-sY3CKp4QfggsCbZERcdc7fxhRM6eQ505jpD6TKE3x577kTe5L-zBOFzDO-V5N3Rki1cpm5UfiBbdeTu55RnaThjYC99QpCMJFm19gLuBPBfYZ2YRAGUPLQBGVavF3Y7lssqRcLhneT6ibcQWCRUf6j38anO0tizLqtedLFtq_YufCzZTJJPBvSjdu2lE8580AIMtqE_AezCqk6sKWZLb3UCBzco9HkiwSZf00mnNW83wVPyWUkPySZlA6pkKqQjtkr"
    ];

    onPostListing({
      title: title.trim(),
      author: author.trim(),
      category,
      subcategory: category === 'School Book' ? subcategory : null,
      price: parseFloat(price) || 0,
      condition,
      conditionDetails: conditionDetails.trim() || "Pristine copy looking for a good home.",
      location: manualLoc.trim() || user.location,
      images: images.length > 0 ? images : bookCoversFallback,
      language: "English",
      pages: 350,
      synopsis: "A wonderful read listed by an avid reader on BookLoop."
    });

    setSuccessMsg('Your book listing has been safely uploaded!');
    
    // Clear form
    setTitle('');
    setAuthor('');
    setPrice('');
    setConditionDetails('');
    setImages([]);
    setSubcategory('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Header section matching list_a_book mockup */}
      <section className="mb-2">
        <h1 className="font-serif text-3xl font-bold text-on-surface">List Your Book</h1>
        <p className="text-xs font-sans text-nocturnal-outline mt-1.5 leading-relaxed">
          Share a story with your local community.
        </p>
      </section>

      {/* Success banner */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-950/40 border border-green-500/30 text-green-200 text-xs p-3.5 rounded-xl flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Upload Drag & Drop container */}
      <section>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 custom-dashed flex flex-col items-center justify-center bg-nocturnal-surface-low hover:bg-nocturnal-surface-high hover:border-primary-lavender/30 transition-all cursor-pointer group p-4 relative"
        >
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          {images.length > 0 ? (
            <div className="w-full h-full flex items-center justify-center gap-3 overflow-x-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-36 bg-nocturnal-surface-lowest rounded-lg overflow-hidden border border-nocturnal-border/40 shrink-0">
                  <img src={img || null} alt="Cover upload" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => removeImage(idx, e)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-24 bg-nocturnal-surface-high rounded-lg flex flex-col items-center justify-center border border-nocturnal-border/40 hover:bg-nocturnal-surface-highest transition-colors font-sans text-[11px] text-primary-lavender gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary-lavender/10 flex items-center justify-center mb-3 group-active:scale-95 transition-transform border border-primary-lavender/25 text-primary-lavender">
                <Camera className="w-5 h-5 text-primary-lavender" />
              </div>
              <span className="text-xs font-semibold text-primary-lavender font-sans uppercase tracking-wider">
                Add Book Photos
              </span>
              <span className="text-[10px] text-nocturnal-outline mt-1 font-sans">
                Up to 5 clear shots
              </span>
            </>
          )}
        </div>
      </section>

      {/* Main listing form fields */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Book Title */}
        <div className="space-y-1.5 focus-within:text-primary-lavender transition-colors">
          <label className="block text-xs font-semibold uppercase tracking-wider text-nocturnal-outline ml-1">
            Book Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Shadow of the Wind"
            className="w-full h-12 px-4 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-on-surface font-sans text-sm placeholder-nocturnal-outline outline-none focus:border-primary-lavender focus:ring-1 focus:ring-primary-lavender/30 transition-all duration-150 font-medium"
          />
        </div>

        {/* Author */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-nocturnal-outline ml-1">
            Author
          </label>
          <input
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Carlos Ruiz Zafón"
            className="w-full h-12 px-4 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-on-surface font-sans text-sm placeholder-nocturnal-outline outline-none focus:border-primary-lavender focus:ring-1 focus:ring-primary-lavender/30 transition-all duration-150 font-medium"
          />
        </div>

        {/* Category & Pricing split container matching mockup */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-nocturnal-outline ml-1">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  if (val === 'School Book') {
                    setSubcategory('12th');
                  } else {
                    setSubcategory('');
                  }
                }}
                className="w-full h-12 pl-4 pr-10 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-on-surface font-sans text-sm outline-none focus:border-primary-lavender focus:ring-1 focus:ring-primary-lavender/30 transition-all duration-150 appearance-none font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-nocturnal-outline font-bold text-[11px] font-sans">
                ▼
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-nocturnal-outline ml-1">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-lavender font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-8 pr-4 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-on-surface font-sans text-sm placeholder-nocturnal-outline outline-none focus:border-primary-lavender focus:ring-1 focus:ring-primary-lavender/30 transition-all duration-150 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Subcategory Segmented controls for School Books */}
        {category === 'School Book' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-nocturnal-outline ml-1">
              Grade Subcategory
            </label>
            <div className="flex p-1 bg-nocturnal-surface-highest rounded-xl gap-1">
              {(['12th', '11th', '10th'] as const).map(sub => {
                const isActive = subcategory === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(sub)}
                    className={`flex-1 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-primary-lavender-dark/40 border border-primary-lavender/25 text-primary-lavender shadow'
                        : 'text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high'
                    }`}
                  >
                    {sub} Grade
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Segmented controls component */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-nocturnal-outline ml-1">
            Condition
          </label>
          <div className="flex p-1 bg-nocturnal-surface-highest rounded-xl gap-1">
            {(['Like New', 'Very Good', 'Well-Loved'] as const).map(cond => {
              const isActive = condition === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`flex-1 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary-lavender-dark/40 border border-primary-lavender/25 text-primary-lavender shadow'
                      : 'text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </div>

        {/* Condition Details textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-nocturnal-outline ml-1">
            Condition Details
          </label>
          <textarea
            value={conditionDetails}
            onChange={(e) => setConditionDetails(e.target.value)}
            placeholder="Describe any dog-ears, highlights, or minor wear..."
            rows={3}
            className="w-full p-4 bg-nocturnal-surface-low border border-nocturnal-border rounded-xl text-on-surface placeholder:text-nocturnal-outline focus:outline-none focus:ring-1 focus:ring-primary-lavender/30 focus:border-primary-lavender transition-all resize-none font-sans text-sm leading-relaxed"
          />
        </div>

        {/* Local Indian mapping box fallback */}
        <div className="bg-nocturnal-surface-low border border-nocturnal-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary-lavender/20 flex items-center justify-center text-primary-lavender">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans font-bold text-on-surface truncate">
                Listing from {manualLoc}
              </p>
              <p className="text-[10px] text-nocturnal-outline font-sans leading-none mt-1">
                Visible based on buyer's preferred distance setting
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="text-xs font-sans text-primary-lavender hover:underline font-semibold cursor-pointer"
            >
              {isEditingLocation ? 'Done' : 'Change'}
            </button>
          </div>

          {/* Location manual setting details exactly from prompt "(or has a option to add location by writing)" */}
          {isEditingLocation && (
            <div className="pt-2">
              <input
                type="text"
                value={manualLoc}
                onChange={(e) => {
                  setManualLoc(e.target.value);
                  onLocationUpdate(e.target.value);
                }}
                placeholder="✍️ Write India area (e.g. Salt Lake, Kolkata)"
                className="w-full h-10 px-3 bg-nocturnal-surface-lowest border border-primary-lavender rounded-lg text-on-surface font-sans text-xs outline-none focus:ring-1 focus:ring-primary-lavender/45 transition-all"
              />
            </div>
          )}
        </div>

        {/* Primary Post Listing Action */}
        <button
          type="submit"
          className="w-full h-14 bg-primary-lavender text-primary-lavender-dark hover:bg-lavender-container font-sans font-bold text-sm rounded-xl transition-all active:scale-98 shadow-lg shadow-primary-lavender/10 cursor-pointer"
        >
          Post Listing
        </button>
      </form>
    </div>
  );
}
