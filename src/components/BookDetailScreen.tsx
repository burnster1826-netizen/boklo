import React, { useState } from 'react';
import { Book, UserProfile } from '../types';
import { ArrowLeft, Heart, Shield, CheckCircle2, AlertTriangle, MessageSquare, MapPin, Eye, BookOpen, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface BookDetailScreenProps {
  book: Book;
  user: UserProfile;
  onBack: () => void;
  onToggleLike: (bookId: string) => void;
  onStartMessage: (book: Book) => void;
  onUnpublishBook?: (bookId: string) => void;
}

export default function BookDetailScreen({
  book,
  user,
  onBack,
  onToggleLike,
  onStartMessage,
  onUnpublishBook
}: BookDetailScreenProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isConfirmingSold, setIsConfirmingSold] = useState(false);
  const isLiked = user.likedBookIds.includes(book.id);

  return (
    <div className="space-y-6 pb-28">
      {/* Back & Close header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-nocturnal-surface-low border border-nocturnal-border/40 flex items-center justify-center hover:bg-nocturnal-surface-high transition-colors active:scale-95 cursor-pointer text-on-surface"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-base font-bold text-primary-lavender truncate max-w-[200px]">
          {book.title}
        </h3>

        <button
          onClick={() => onToggleLike(book.id)}
          className={`w-10 h-10 rounded-full bg-nocturnal-surface-low border border-nocturnal-border/40 flex items-center justify-center hover:bg-nocturnal-surface-high transition-colors active:scale-95 cursor-pointer ${
            isLiked ? 'text-primary-lavender' : 'text-nocturnal-outline'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary-lavender text-primary-lavender' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Cover carousel (Takes 5 spans) */}
        <div className="md:col-span-5 space-y-6">
          {/* Book Cover Image carousel */}
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-nocturnal-border/55">
            <img
              src={book.images?.[activeImageIdx] || null}
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Carousel indicators if multiple covers exist */}
            {book.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-nocturnal-surface-lowest/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-nocturnal-border/20">
                {book.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      activeImageIdx === idx ? 'bg-primary-lavender w-3.5' : 'bg-nocturnal-outline/50 hover:bg-nocturnal-outline'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Book Metadata, Synopsis tabs, Seller overview, quality check list & swap trigger buttons */}
        <div className="md:col-span-7 space-y-6">
          {/* Book Metadata & Title Area */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1.5 items-center mb-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-primary-lavender bg-primary-lavender/10 border border-primary-lavender/25 px-1.5 py-0.5 rounded">
                    {book.category}
                  </span>
                  {book.subcategory && (
                    <span className="text-[9px] uppercase font-bold tracking-widest text-green-300 bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      🎓 {book.subcategory} Grade
                    </span>
                  )}
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary-lavender leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm font-sans text-nocturnal-muted">
                  By <span className="font-semibold text-on-surface hover:underline">{book.author}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl md:text-2xl font-sans font-bold text-primary-lavender">
                  {book.price === 0 ? "Free" : `₹${book.price}`}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-nocturnal-outline font-sans">
                  Local Sale/Pickup
                </p>
              </div>
            </div>

            {/* Highlight details chips */}
            <div className="flex flex-wrap gap-2 pt-1.5">
              <span className="px-3 py-1 rounded-full bg-primary-lavender/10 border border-primary-lavender/30 text-primary-lavender font-sans text-xs flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-primary-lavender" /> Condition: {book.condition}
              </span>
              <span className="px-3 py-1 rounded-full bg-nocturnal-surface-high border border-nocturnal-border text-on-surface font-sans text-xs flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-nocturnal-outline" /> {book.distance.toFixed(1)} km away
              </span>
            </div>
          </div>

          {/* Seller's Swap Notes & Quality */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-on-surface uppercase tracking-wider font-sans">
              Seller's Copy Quality & Pricing
            </h4>
            <div className="text-nocturnal-muted font-sans text-sm leading-relaxed antialiased">
              <p className="bg-nocturnal-surface/30 p-4 border border-nocturnal-border/10 rounded-xl italic">
                "{book.conditionDetails || "This copy is kept under meticulous bookshelves. Rest assured, all pages are intact and neat."}"
              </p>
            </div>
          </div>



          {/* Seller overview card matching design */}
          <div className="bg-nocturnal-surface-low border border-nocturnal-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={book.seller.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDD6jYKtqzMy5u0quFotrcNChrjSBIRKoPYpq-fugsf-akwrt3x4RJ42z1V_E8sfje_gw1SZi4d2graYXPeY9dPDL3SMIOx8gJ2b-jBnxpuJuIxU3Sw6wJi6C8diUAzYpKthlCOlO189IeHUE0POjNr7QiOvkp796irWOmKMB0Kr4XYiluYHhsIbUh3Ui_STVVj4NiIqv-FQOvP96F-OfTjdC6ILEdNfIXtMwhuPvURRw2BUzA9qGB1qTUn2qq6rIGZ9vx-hp7CpiqS"}
                alt={book.seller.name || "Seller"}
                className="w-11 h-11 rounded-full object-cover border border-nocturnal-border"
              />
              <div>
                <p className="text-xs font-serif font-bold text-on-surface">
                  {book.seller.name}
                </p>
                <p className="text-[11px] font-sans text-nocturnal-outline mt-0.5">
                  {book.seller.swaps === 0 ? "No rating yet (0 sold)" : `⭐ ${book.seller.rating} (${book.seller.swaps} sold)`} • Verified Seller
                </p>
              </div>
            </div>
            <div>
              {book.seller.isTrusted ? (
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                  ★ TRUSTED
                </span>
              ) : (
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-nocturnal-outline bg-nocturnal-surface-high border border-nocturnal-border/40 px-2 py-1 rounded">
                  STANDARD
                </span>
              )}
            </div>
          </div>

          {/* Action triggers styled natively on desktop, fixed bottom bar on mobile */}
          <div className="hidden md:flex gap-3 pt-3">
            <button
              onClick={() => onToggleLike(book.id)}
              className={`w-14 h-14 rounded-xl border flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
                isLiked
                  ? 'bg-primary-lavender-dark/20 border-primary-lavender text-primary-lavender'
                  : 'bg-nocturnal-surface border-nocturnal-border text-on-surface hover:text-primary-lavender'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary-lavender' : ''}`} />
            </button>

            {book.seller.name === user.name ? (
              <div className="flex-grow flex flex-col gap-2">
                {!isConfirmingSold ? (
                  <div className="flex gap-2">
                    <div className="flex-grow h-14 bg-nocturnal-surface-low border border-nocturnal-border/80 text-nocturnal-outline font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 px-3">
                      <CheckCircle2 className="w-4.5 h-4.5 text-nocturnal-outline" />
                      Your Published Book
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingSold(true)}
                      className="px-6 h-14 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-rose-600/10 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Mark as Sold
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full animate-pulse">
                    <button
                      type="button"
                      onClick={() => {
                        if (onUnpublishBook) onUnpublishBook(book.id);
                      }}
                      className="flex-grow h-14 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-rose-600/10 active:scale-98 transition-all cursor-pointer whitespace-nowrap px-4 animate-bounce"
                    >
                      Confirm Sold?
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingSold(false)}
                      className="px-4 h-14 bg-nocturnal-surface-low border border-nocturnal-border text-on-surface font-sans font-bold text-sm rounded-xl flex items-center justify-center hover:bg-nocturnal-surface-high active:scale-98 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onStartMessage(book)}
                className="flex-grow h-14 bg-primary-lavender text-primary-lavender-dark hover:bg-lavender-container font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary-lavender/10 active:scale-98 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4.5 h-4.5 fill-primary-lavender-dark" />
                Message Seller to Buy
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE ONLY: FIXED FOOTER CALL TO ACTIONS */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-nocturnal-surface-lowest/80 backdrop-blur-md border-t border-nocturnal-border/50 z-50 py-4 px-6 flex items-center justify-center">
        <div className="w-full max-w-lg flex items-center gap-3">
          <button
            onClick={() => onToggleLike(book.id)}
            className={`w-14 h-14 rounded-xl border flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
              isLiked
                ? 'bg-primary-lavender-dark/20 border-primary-lavender text-primary-lavender'
                : 'bg-nocturnal-surface border-nocturnal-border text-on-surface hover:text-primary-lavender'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary-lavender' : ''}`} />
          </button>

          {book.seller.name === user.name ? (
            <div className="flex-grow flex flex-col gap-1.5 w-full">
              {!isConfirmingSold ? (
                <>
                  <div className="h-8 bg-nocturnal-surface-low border border-nocturnal-border/80 text-nocturnal-outline font-sans font-bold text-[10px] rounded-lg flex items-center justify-center gap-1.5 px-3">
                    <CheckCircle2 className="w-3.5 h-3.5 text-nocturnal-outline" />
                    Your Published Book
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingSold(true)}
                    className="h-11 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-rose-600/10 active:scale-98 transition-all cursor-pointer w-full"
                  >
                    Mark as Sold
                  </button>
                </>
              ) : (
                <div className="flex gap-1.5 w-full animate-pulse">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUnpublishBook) onUnpublishBook(book.id);
                    }}
                    className="flex-grow h-11 bg-rose-600 hover:bg-rose-500 text-white font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-rose-600/10 active:scale-98 transition-all cursor-pointer animate-smooth"
                  >
                    Confirm Sold
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingSold(false)}
                    className="px-3 h-11 bg-nocturnal-surface-low border border-nocturnal-border text-on-surface font-sans font-bold text-xs rounded-xl flex items-center justify-center hover:bg-nocturnal-surface-high active:scale-98 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onStartMessage(book)}
              className="flex-grow h-14 bg-primary-lavender text-primary-lavender-dark hover:bg-lavender-container font-sans font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-primary-lavender/10 active:scale-98 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4.5 h-4.5 fill-primary-lavender-dark" />
              Message Seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
