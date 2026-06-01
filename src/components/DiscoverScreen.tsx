import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Book, UserProfile } from '../types';
import { Search, MapPin, Heart, ArrowRight, BookOpen, SlidersHorizontal, EyeOff, X, ArrowUpDown, Tag, Sparkles, Check, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DiscoverScreenProps {
  books: Book[];
  user: UserProfile;
  onBookSelect: (book: Book) => void;
  onToggleLike: (bookId: string) => void;
  onOpenDistanceFilter: () => void;
  onUpdateDistanceFilter?: (distance: number) => void;
  filterDistance: number;
}

const CATEGORIES = ["All", "Free", "Fiction", "Sci-Fi", "Philosophy", "Poetry", "Mystery", "Non-Fiction", "School Book"];

const POPULAR_PRESETS = [
  { label: '✨ Like New', query: 'Like New' },
  { label: '🎁 Free Loop', query: 'Free' },
  { label: '🧠 Philosophy', query: 'Philosophy' },
  { label: '💸 Budget (< ₹250)', query: 'budget' },
  { label: '📖 Fiction', query: 'Fiction' }
];

export default function DiscoverScreen({
  books,
  user,
  onBookSelect,
  onToggleLike,
  onOpenDistanceFilter,
  onUpdateDistanceFilter,
  filterDistance
}: DiscoverScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState<'All' | '12th' | '11th' | '10th'>('All');
  const [sortBy, setSortBy] = useState<'default' | 'distance' | 'priceAsc' | 'priceDesc' | 'condition'>('default');
  const [onlyTrustedSellers, setOnlyTrustedSellers] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Active filter count computation for display badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sortBy !== 'default') count++;
    if (onlyTrustedSellers) count++;
    if (onlyFree) count++;
    if (filterDistance !== 5) count++; // 5 km is the base default distance set in App.tsx
    return count;
  }, [sortBy, onlyTrustedSellers, onlyFree, filterDistance]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (!searchQuery && activeFilterCount === 0) {
          setIsSearchActive(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery, activeFilterCount]);

  // Parse and match queries efficiently
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      // 1. Text-based search on multiple fields (Search Title, Author, Category, Subcategory, Synopsis, Condition details, Seller)
      let matchesSearch = true;
      const q = searchQuery.trim().toLowerCase();
      
      if (q) {
        if (q === 'budget') {
          matchesSearch = book.price > 0 && book.price < 250;
        } else if (q === 'free') {
          matchesSearch = book.price === 0;
        } else if (q === 'like new' || q === 'likenew') {
          matchesSearch = book.condition.toLowerCase() === 'like new';
        } else {
          matchesSearch = 
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.category.toLowerCase().includes(q) ||
            (book.subcategory && book.subcategory.toLowerCase().includes(q)) ||
            (book.synopsis && book.synopsis.toLowerCase().includes(q)) ||
            (book.conditionDetails && book.conditionDetails.toLowerCase().includes(q)) ||
            (book.seller && book.seller.name.toLowerCase().includes(q));
        }
      }

      // 2. Tab/Category Filter
      const matchesCategory = 
        activeCategory === 'All' || 
        (activeCategory === 'Free' ? book.price === 0 : book.category === activeCategory);

      // 3. School Book subcategory levels
      const matchesSubcategory = 
        activeCategory !== 'School Book' || 
        activeSubcategory === 'All' || 
        book.subcategory === activeSubcategory;

      // 4. Circle of Distance
      const matchesDistance = book.distance <= filterDistance;

      // 5. Toggle filters
      const matchesTrusted = !onlyTrustedSellers || !!book.seller?.isTrusted;
      const matchesFreeToggle = !onlyFree || book.price === 0;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesDistance && matchesTrusted && matchesFreeToggle;
    });
  }, [books, searchQuery, activeCategory, activeSubcategory, filterDistance, onlyTrustedSellers, onlyFree]);

  // Order books according to sorting state
  const sortedAndFilteredBooks = useMemo(() => {
    const list = [...filteredBooks];
    if (sortBy === 'default') {
      const getPopularityScore = (b: Book) => {
        const sellerSwaps = b.seller?.swaps || 0;
        const sellerRating = b.seller?.rating || 4.2;
        const likedBonus = user?.likedBookIds?.includes(b.id) ? 120 : 0;
        const deterministicWeight = (b.id.charCodeAt(b.id.length - 1) || 0) * 0.4 + (b.title.length * 1.5);
        return (sellerSwaps * 2) + ((sellerRating - 4.0) * 80) + likedBonus + deterministicWeight;
      };
      return list.sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
    }
    if (sortBy === 'distance') {
      return list.sort((a, b) => a.distance - b.distance);
    }
    if (sortBy === 'priceAsc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'priceDesc') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'condition') {
      const conditionWeights = { 'Like New': 3, 'Very Good': 2, 'Well-Loved': 1 };
      return list.sort((a, b) => {
        const weightA = conditionWeights[a.condition] || 0;
        const weightB = conditionWeights[b.condition] || 0;
        return weightB - weightA;
      });
    }
    return list; // Default original database list order
  }, [filteredBooks, sortBy, user.likedBookIds]);

  // Safe Highlight Matching component helper to spotlight matched search text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    // Strip special regex chars to protect parsing flow
    const escapedQuery = query.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-primary-lavender-dark text-primary-lavender px-0.5 rounded-sm font-semibold select-none">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const activeSortLabel = useMemo(() => {
    switch (sortBy) {
      case 'default': return 'Most Popular (Default)';
      case 'distance': return 'Nearest First';
      case 'priceAsc': return 'Cheapest First';
      case 'priceDesc': return 'Highest Price';
      case 'condition': return 'Top Quality';
      default: return 'Most Popular (Default)';
    }
  }, [sortBy]);

  // Reset helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveSubcategory('All');
    setSortBy('default');
    setOnlyTrustedSellers(false);
    setOnlyFree(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Block & Interactive Header */}
      <div ref={searchContainerRef} className="space-y-3">
        <div className="flex gap-2.5 items-center">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchActive(true);
              }}
              onFocus={() => setIsSearchActive(true)}
              onClick={() => setIsSearchActive(true)}
              placeholder="Search titles, authors, synopsis, or sellers..."
              className="w-full bg-nocturnal-surface-low border border-nocturnal-border/80 rounded-xl py-3.5 pl-11 pr-10 font-sans text-sm focus:border-primary-lavender focus:ring-1 focus:ring-primary-lavender/30 outline-none placeholder-nocturnal-outline text-on-surface transition-all duration-150"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-nocturnal-outline w-4.5 h-4.5" />
            
            <AnimatePresence>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-nocturnal-outline hover:text-on-surface hover:bg-nocturnal-surface-high rounded-full transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Unified Advanced Filters Dropdown */}
          <AnimatePresence>
            {(isSearchActive || searchQuery || activeFilterCount > 0) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.92, width: 0 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className={`h-12 px-4 rounded-xl border font-sans text-xs flex items-center gap-2 select-none whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isFilterPanelOpen || activeFilterCount > 0
                      ? 'bg-primary-lavender/15 border-primary-lavender text-primary-lavender font-semibold shadow-md shadow-primary-lavender/5'
                      : 'bg-nocturnal-surface-low border-nocturnal-border hover:bg-nocturnal-surface-high text-on-surface'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-primary-lavender text-primary-lavender-dark">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {isFilterPanelOpen && (
                  <>
                    {/* Click outside to close */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsFilterPanelOpen(false)}
                    />
                    
                    {/* Filters Dropdown Card (Absolute Overlay) */}
                    <div className="absolute right-0 mt-2.5 w-72 sm:w-80 rounded-2xl bg-[#09070F] border border-nocturnal-border/80 shadow-2xl p-5 z-50 space-y-4">
                      <div className="flex items-center justify-between border-b border-nocturnal-border/15 pb-2.5">
                        <span className="text-xs font-sans font-bold text-on-surface uppercase tracking-wider">
                          BookLoop Filters
                        </span>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={handleResetFilters}
                            className="text-[10px] font-sans font-bold text-accent-terracotta hover:underline"
                          >
                            Reset All
                          </button>
                        )}
                      </div>

                      {/* Section 1: Circle of Distance Filter options */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-sans font-bold text-nocturnal-outline uppercase tracking-wider">
                          1. Max Distance (Buyer preference)
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[5, 10, 25, 50].map((dist) => {
                            const isDistSelected = filterDistance === dist;
                            return (
                              <button
                                key={dist}
                                type="button"
                                onClick={() => onUpdateDistanceFilter?.(dist)}
                                className={`py-2 rounded-lg border text-center font-sans text-xs font-bold transition-all duration-150 cursor-pointer ${
                                  isDistSelected
                                    ? 'bg-primary-lavender/20 border-primary-lavender text-primary-lavender font-semibold'
                                    : 'bg-[#151221] border-[#2a2444] text-nocturnal-outline hover:text-on-surface'
                                }`}
                              >
                                {dist} km
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Sorting Criteria (Sorting Options) */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-sans font-bold text-nocturnal-outline uppercase tracking-wider">
                          2. Sort By
                        </p>
                        <div className="space-y-1">
                          {[
                            { value: 'default', label: 'Most Popular (Default)' },
                            { value: 'distance', label: 'Nearest First (Distance)' },
                            { value: 'priceAsc', label: 'Cheapest First' },
                            { value: 'priceDesc', label: 'Highest Price' },
                            { value: 'condition', label: 'Premium Quality First' },
                          ].map((option) => {
                            const isSortSelected = sortBy === option.value;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setSortBy(option.value as any)}
                                className={`w-full text-left font-sans text-xs px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                                  isSortSelected
                                    ? 'bg-primary-lavender/10 text-primary-lavender font-semibold'
                                    : 'hover:bg-nocturnal-surface-low text-nocturnal-muted hover:text-on-surface'
                                }`}
                              >
                                <span>{option.label}</span>
                                {isSortSelected && <Check className="w-3.5 h-3.5 text-primary-lavender" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Direct Toggle Filters */}
                      <div className="space-y-2 border-t border-nocturnal-border/15 pt-3">
                        <p className="text-[10px] font-sans font-bold text-nocturnal-outline uppercase tracking-wider">
                          3. Additional Settings
                        </p>
                        
                        <div className="space-y-2.5">
                          <label className="flex items-center justify-between text-xs font-sans text-nocturnal-muted cursor-pointer select-none">
                            <span>Free books only</span>
                            <input
                              type="checkbox"
                              checked={onlyFree}
                              onChange={(e) => setOnlyFree(e.target.checked)}
                              className="w-4 h-4 rounded border-[#2a2444] text-primary-lavender focus:ring-primary-lavender bg-[#151221] accent-primary-lavender cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between text-xs font-sans text-nocturnal-muted cursor-pointer select-none">
                            <span className="flex items-center gap-1">
                              Trusted Sellers only <ShieldCheck className="w-3.5 h-3.5 text-accent-terracotta inline" />
                            </span>
                            <input
                              type="checkbox"
                              checked={onlyTrustedSellers}
                              onChange={(e) => setOnlyTrustedSellers(e.target.checked)}
                              className="w-4 h-4 rounded border-[#2a2444] text-primary-lavender focus:ring-primary-lavender bg-[#151221] accent-primary-lavender cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Close Helper */}
                      <div className="border-t border-nocturnal-border/15 pt-3">
                        <button
                          onClick={() => setIsFilterPanelOpen(false)}
                          className="w-full py-2 bg-primary-lavender text-primary-lavender-dark text-xs font-sans font-bold rounded-xl hover:bg-opacity-90 transition active:scale-95 cursor-pointer"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Multi-Search Preset suggestions if query of search is empty */}
        <AnimatePresence>
          {(isSearchActive || searchQuery || activeFilterCount > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 items-center flex-wrap overflow-hidden"
            >
              <span className="text-[10px] font-sans font-bold text-nocturnal-outline uppercase tracking-wider pr-1 leading-none">
                Popular:
              </span>
              {POPULAR_PRESETS.map((preset) => {
                const isMatch = searchQuery === preset.query;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setSearchQuery(preset.query);
                      setIsSearchActive(true);
                    }}
                    className={`text-[11px] font-sans px-2.5 py-1 rounded-full border transition-all duration-150 whitespace-nowrap cursor-pointer ${
                      isMatch
                        ? 'bg-primary-lavender border-primary-lavender text-primary-lavender-dark font-medium shadow-sm'
                        : 'bg-nocturnal-surface border-nocturnal-border/50 text-nocturnal-outline hover:text-on-surface hover:border-nocturnal-border'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Active Results Statistics Badge */}
      <div className="flex justify-between items-center text-xs font-sans text-nocturnal-outline pb-1 select-none">
        <div>
          Showing <span className="text-on-surface font-semibold">{sortedAndFilteredBooks.length}</span> matching {sortedAndFilteredBooks.length === 1 ? 'book' : 'books'}
        </div>
        <div>
          Radius: <span className="text-on-surface font-semibold">{user.location} ({filterDistance} km)</span>
        </div>
      </div>

      {/* Conditional View Rendering: Grid or Search Rescue Screen */}
      <div>
        {sortedAndFilteredBooks.length === 0 ? (
          <div className="bg-nocturnal-surface border border-nocturnal-border/45 rounded-2xl py-12 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-nocturnal-surface-low border border-nocturnal-border/50 flex items-center justify-center mx-auto">
              <EyeOff className="w-8 h-8 text-nocturnal-outline stroke-1.5" />
            </div>
            
            <div className="space-y-1.5 max-w-sm mx-auto">
              <p className="text-on-surface font-sans font-semibold text-base">No books fit this loop search.</p>
              <p className="text-xs text-nocturnal-outline font-sans">
                No matching results were found for <strong className="text-primary-lavender">"{searchQuery || activeCategory}"</strong> within {filterDistance} km of {user.location}.
              </p>
            </div>

            {/* Rescue Helpers */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center items-center max-w-md mx-auto">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-full sm:w-auto px-4 py-2 bg-nocturnal-surface-high hover:bg-nocturnal-surface-highest border border-nocturnal-border text-on-surface text-xs font-sans font-bold rounded-xl transition"
                >
                  Clear search query
                </button>
              )}
              <button
                onClick={onOpenDistanceFilter}
                className="w-full sm:w-auto px-4 py-2 bg-primary-lavender text-primary-lavender-dark text-xs font-sans font-bold rounded-xl hover:bg-opacity-90 transition"
              >
                Expand distance filter radius
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-4 py-2 border border-nocturnal-border/70 text-nocturnal-outline hover:text-on-surface text-xs font-sans rounded-xl transition"
              >
                Reset all filters
              </button>
            </div>
          </div>
        ) : (
          /* IMPROVED Bento Grid Render */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {sortedAndFilteredBooks.map((book) => {
              const isLiked = user.likedBookIds.includes(book.id);
              
              return (
                <div
                  key={book.id}
                  onClick={() => onBookSelect(book)}
                  className="group cursor-pointer space-y-2.5 bg-nocturnal-surface/40 hover:bg-nocturnal-surface/80 p-2.5 border border-nocturnal-border/10 hover:border-nocturnal-border/30 rounded-2xl transition-all duration-200"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-nocturnal-surface-lowest flex items-center justify-center border border-nocturnal-border/50">
                    <img
                      src={book.images?.[0] || undefined}
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
                      {highlightText(book.title, searchQuery)}
                    </h3>
                    <p className="text-nocturnal-outline font-sans text-xs truncate">
                      {highlightText(book.author, searchQuery)}
                    </p>
                    
                    {/* Show search matched subcategory or conditionDetails preview if available */}
                    {searchQuery && book.synopsis && book.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) && (
                      <p className="text-[10px] text-primary-lavender/70 font-sans line-clamp-1 italic max-w-full truncate bg-nocturnal-surface-low/60 rounded px-1.5 py-0.5">
                        Matched synopsis: "{book.synopsis}"
                      </p>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-primary-lavender font-sans font-bold text-sm">
                        {book.price === 0 ? "Free" : `₹${book.price}`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {book.seller?.isTrusted && (
                          <div className="flex items-center" title="Trusted loop seller">
                            <ShieldCheck className="w-3.5 h-3.5 text-accent-terracotta" />
                          </div>
                        )}
                        <span className="flex items-center gap-0.5 text-nocturnal-outline text-[10px] font-sans">
                          <MapPin className="w-3 h-3 text-nocturnal-outline shrink-0" /> {book.distance.toFixed(1)} km
                        </span>
                      </div>
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
