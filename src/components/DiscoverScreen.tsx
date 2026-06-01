import React, { useState } from 'react';
import { Book, UserProfile } from '../types';
import { Search, MapPin, Heart, ArrowRight, BookOpen, SlidersHorizontal, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DiscoverScreenProps {
  books: Book[];
  user: UserProfile;
  onBookSelect: (book: Book) => void;
  onToggleLike: (bookId: string) => void;
  onOpenDistanceFilter: () => void;
  filterDistance: number;
}

const CATEGORIES = ["All", "Free", "Fiction", "Sci-Fi", "Philosophy", "Poetry", "Mystery", "Non-Fiction", "School Book"];

export default function DiscoverScreen({
  books,
  user,
  onBookSelect,
  onToggleLike,
  onOpenDistanceFilter,
  filterDistance
}: DiscoverScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState<'All' | '12th' | '11th' | '10th'>('All');

  // Filter books based on search query, active category, subcategory, and distance slider
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.subcategory && book.subcategory.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === 'All' || 
      (activeCategory === 'Free' ? book.price === 0 : book.category === activeCategory);

    const matchesSubcategory = 
      activeCategory !== 'School Book' || 
      activeSubcategory === 'All' || 
      book.subcategory === activeSubcategory;

    const matchesDistance = book.distance <= filterDistance;

    return matchesSearch && matchesCategory && matchesSubcategory && matchesDistance;
  });

  return (
    <div className="space-y-6">
      {/* Search Block */}
      <div className="relative flex-grow">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search titles, authors, genres..."
          className="w-full bg-nocturnal-surface-low border border-nocturnal-border rounded-xl py-3.5 pl-11 pr-4 font-sans text-sm focus:border-primary-lavender focus:ring-1 focus:ring-primary-lavender/30 outline-none placeholder-nocturnal-outline text-on-surface transition-all duration-150"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-nocturnal-outline w-4.5 h-4.5" />
      </div>

      {/* Category Horizontal Custom Scroller */}
      <div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map(category => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setActiveSubcategory('All');
                }}
                className={`px-5 py-2 rounded-full font-sans text-[13px] font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary-lavender text-primary-lavender-dark shadow-md shadow-primary-lavender/10'
                    : 'bg-nocturnal-surface-low hover:bg-nocturnal-surface-high border border-nocturnal-border text-on-surface'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* School Book Grade Subcategory Bar */}
      {activeCategory === 'School Book' && (
        <div className="flex gap-2 items-center bg-nocturnal-surface-low border border-nocturnal-border/40 p-2.5 rounded-xl">
          <span className="text-[10px] font-sans font-bold text-nocturnal-outline uppercase tracking-wider pl-1.5 shrink-0">
            Grades:
          </span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(['All', '12th', '11th', '10th'] as const).map(sub => {
              const isActive = activeSubcategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setActiveSubcategory(sub)}
                  className={`px-3 py-1 rounded-lg text-xs font-sans font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-primary-lavender/20 border border-primary-lavender/40 text-primary-lavender'
                      : 'bg-nocturnal-surface-highest/50 hover:bg-nocturnal-surface-highest border border-nocturnal-border text-nocturnal-outline hover:text-on-surface'
                  }`}
                >
                  {sub === 'All' ? 'All Grades' : `${sub} Grade`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Conditional View Rendering: Map Radar or Bento Grid */}
      <div>
        {filteredBooks.length === 0 ? (
          <div className="bg-nocturnal-surface border border-nocturnal-border/40 rounded-2xl py-11 px-4 text-center">
            <BookOpen className="w-12 h-12 text-nocturnal-outline mx-auto stroke-1.5 mb-3" />
            <p className="text-on-surface font-sans font-medium text-sm">No books found in this circle.</p>
            <p className="text-xs text-nocturnal-outline mt-1 font-sans">
              Try adjusting your search query, genre category or distance filter ({filterDistance} km).
            </p>
          </div>
        ) : (
          /* STANDARD GRID VIEW RENDERER */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {filteredBooks.map((book) => {
              const isLiked = user.likedBookIds.includes(book.id);
              
              return (
                <div
                  key={book.id}
                  onClick={() => onBookSelect(book)}
                  className="group cursor-pointer space-y-2.5 bg-nocturnal-surface/40 hover:bg-nocturnal-surface/80 p-2.5 border border-nocturnal-border/10 hover:border-nocturnal-border/30 rounded-2xl transition-all duration-200"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-nocturnal-surface-lowest flex items-center justify-center border border-nocturnal-border/50">
                    <img
                      src={book.images?.[0] || null}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Like button overlay */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(book.id);
                        }}
                        className={`w-8 h-8 rounded-full bg-nocturnal-surface-lowest/70 backdrop-blur-md flex items-center justify-center border border-nocturnal-border/20 active:scale-90 transition-transform ${
                          isLiked ? 'text-primary-lavender' : 'text-nocturnal-outline hover:text-on-surface'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 transition-all duration-200 ${
                            isLiked ? 'fill-primary-lavender stroke-primary-lavender' : 'stroke-2'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Book Quality Tag */}
                    <div className="absolute bottom-2.5 left-2.5 z-10 flex flex-wrap gap-1 bg-nocturnal-surface-lowest/40 p-0.5 rounded backdrop-blur-xs">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-bold tracking-wider uppercase border ${
                        book.condition === 'Like New'
                          ? 'bg-primary-lavender-dark/40 border-primary-lavender text-primary-lavender'
                          : book.condition === 'Very Good'
                          ? 'bg-blue-950/40 border-blue-400 text-blue-200'
                          : 'bg-amber-950/40 border-amber-400 text-amber-200'
                      }`}>
                        {book.condition}
                      </span>
                      {book.subcategory && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-sans font-bold tracking-wider uppercase border bg-green-950/60 border-green-500 text-green-200">
                          {book.subcategory}
                        </span>
                      )}
                    </div>

                    {/* Inner glowing stroke helper */}
                    <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-xl"></div>
                  </div>

                  <div className="px-1 space-y-1">
                    <h3 className="font-serif text-sm font-semibold text-on-surface leading-tight truncate group-hover:text-primary-lavender transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-nocturnal-outline font-sans text-xs truncate">
                      {book.author}
                    </p>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-primary-lavender font-sans font-bold text-sm">
                        {book.price === 0 ? "Free" : `₹${book.price}`}
                      </span>
                      <span className="flex items-center gap-0.5 text-nocturnal-outline text-[10px] font-sans">
                        <MapPin className="w-3 h-3 text-nocturnal-outline shrink-0" /> {book.distance.toFixed(1)} km
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Beautiful Neighborhood Curated sale statistics bar */}
      <div className="bg-gradient-to-r from-primary-lavender/5 to-accent-terracotta/5 border border-nocturnal-border/40 rounded-xl p-4 flex items-center justify-between text-xs font-sans">
        <div className="space-y-0.5">
          <p className="text-on-surface font-semibold">Active in {user.location}</p>
          <p className="text-[11px] text-nocturnal-outline">
            {books.filter(b => b.location === user.location).length} neighbors selling books around you.
          </p>
        </div>
        <div className="flex -space-x-2">
          <img className="w-7 h-7 rounded-full border border-nocturnal-bg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLT66UOMU05jK-59RuMPn4PtZJGAdVwbAI9uippuI52KkmZxLcTkJzGLtNrAfEc0CAAp7nrnJLXzA2WBTpw8x7rztmq4WBVPT5DRzc0naLMJ5WQSKdAHxljZUG75iZdoFNsSaKghvYzklpIX8syuiYbMu8h6A54o79aGCyv1wcDgCHZuLxxy_IAx1ZPZYm6yNweTbolPe3K-I_-j-m_6Trpmb7LE6_WmrzszQOsTCPAwwJHfLKRHoqoSE1zCs_XLQuT63bsBkXLT7Q" alt="User" />
          <img className="w-7 h-7 rounded-full border border-nocturnal-bg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvrGyXbjJ6XkrTQyrbTTv6T9NUoYQk7fO4VzW6YXakqyQuaCdWWTnHLnz37yjwo7ryQ9M33hQdg4-2v5eNVfw7zij7DS__-IoDYA2Pa4aFeW6BQrIWYOVGVBfEvynTCs-ztC2j_A1OLlWh5vRVk7VHi8Y98Axqu5EDKgDU6Cx-wjhP0hZPKI1xEAnJxZdpOUFO0uCpVwJosfqaMw97j7JaKVapc2-1bgxthgSWSPtZOMWpSnYhC_SuvxelOlSKHNypK0O3_vubV72O" alt="User" />
          <img className="w-7 h-7 rounded-full border border-nocturnal-bg object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClBnvXSjpwPT1Ee1lECLazDg1UjZYQbtuA_c0GISBPAHCkv3VtBO34annX5pEpKD3erYKJX4WiYtgRaIIkNp3vnmMc48TqKppo5cyWYT-MfhIYCwrGn6uhaa4WZZMlYaLM-CNsw1mn29hnW8NP4hUlhanEpODw1LGOV-NwWzYGexURAcYXPvCZcR_OE5gk8F1YrpZwgN424Vf5KVnfBjQwY8yew1J4nVIZ5nDvMWvjfUwbxhp-xatE1K7Zl0knlHJlJLsm-hwO7-KM" alt="User" />
        </div>
      </div>
    </div>
  );
}
