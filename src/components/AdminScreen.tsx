import React, { useState } from 'react';
import { Book, UserProfile } from '../types';
import { 
  Shield, 
  Trash2, 
  UserX, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  BookOpen, 
  Search, 
  Star, 
  MapPin, 
  Check, 
  X,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminScreenProps {
  user: UserProfile;
  users: any[];
  books: Book[];
  onDeleteUser: (uid: string) => Promise<void>;
  onDeleteBook: (bookId: string) => Promise<void>;
  onToggleTrustUser: (uid: string, currentStatus: boolean) => Promise<void>;
  blocklistedUsers: any[];
  onUnblockUser: (uid: string, userDetails: any) => Promise<void>;
  onDeleteBlocklistUserPermanently: (uid: string) => Promise<void>;
}

export default function AdminScreen({
  user,
  users,
  books,
  onDeleteUser,
  onDeleteBook,
  onToggleTrustUser,
  blocklistedUsers,
  onUnblockUser,
  onDeleteBlocklistUserPermanently
}: AdminScreenProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'books' | 'blocklist'>('users');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [blocklistSearchTerm, setBlocklistSearchTerm] = useState('');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [confirmingDeleteUserUid, setConfirmingDeleteUserUid] = useState<string | null>(null);
  const [confirmingDeleteBookId, setConfirmingDeleteBookId] = useState<string | null>(null);
  const [confirmingUnblockUserUid, setConfirmingUnblockUserUid] = useState<string | null>(null);
  const [confirmingPermanentDeleteUid, setConfirmingPermanentDeleteUid] = useState<string | null>(null);

  // Filter users
  const filteredUsers = users.filter(u => {
    const term = userSearchTerm.toLowerCase();
    const nameMatch = (u.name || '').toLowerCase().includes(term);
    const emailMatch = (u.email || '').toLowerCase().includes(term);
    const locationMatch = (u.location || '').toLowerCase().includes(term);
    return nameMatch || emailMatch || locationMatch;
  });

  // Filter books
  const filteredBooks = books.filter(b => {
    const term = bookSearchTerm.toLowerCase();
    const titleMatch = (b.title || '').toLowerCase().includes(term);
    const authorMatch = (b.author || '').toLowerCase().includes(term);
    const categoryMatch = (b.category || '').toLowerCase().includes(term);
    const sellerMatch = (b.seller?.name || '').toLowerCase().includes(term);
    return titleMatch || authorMatch || categoryMatch || sellerMatch;
  });

  // Filter blocklist
  const filteredBlocklist = (blocklistedUsers || []).filter(u => {
    const term = blocklistSearchTerm.toLowerCase();
    const nameMatch = (u.name || '').toLowerCase().includes(term);
    const emailMatch = (u.email || '').toLowerCase().includes(term);
    const locationMatch = (u.location || '').toLowerCase().includes(term);
    return nameMatch || emailMatch || locationMatch;
  });

  const handleAction = async (actionId: string, actionFn: () => Promise<void>) => {
    setIsActionLoading(actionId);
    try {
      await actionFn();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Premium Admin Header */}
      <div className="bg-gradient-to-r from-primary-lavender/10 via-nocturnal-surface-low to-nocturnal-surface border border-primary-lavender/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="w-48 h-48 text-primary-lavender" />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-primary-lavender/20 text-primary-lavender rounded-lg">
                <Shield className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary-lavender">
                System Admin Console
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
              Welcome, Administrator
            </h2>
            <p className="text-xs text-nocturnal-outline font-sans max-w-xl">
              Signed in as <span className="text-primary-lavender font-semibold">{user.email}</span>. You have full destructive overwrite authorizations to enforce safe peer-to-peer book transactions within the local BookLoop market.
            </p>
          </div>

          <div className="flex gap-4 shrink-0 overflow-x-auto no-scrollbar">
            <div className="bg-nocturnal-surface-high/60 border border-nocturnal-border/40 px-4 py-3 rounded-xl text-center min-w-[90px]">
              <p className="text-xl font-bold text-primary-lavender font-serif">{users.length}</p>
              <p className="text-[9px] text-nocturnal-outline uppercase tracking-wider font-sans mt-0.5">Total Users</p>
            </div>
            <div className="bg-nocturnal-surface-high/60 border border-nocturnal-border/40 px-4 py-3 rounded-xl text-center min-w-[90px]">
              <p className="text-xl font-bold text-primary-lavender font-serif">{books.length}</p>
              <p className="text-[9px] text-nocturnal-outline uppercase tracking-wider font-sans mt-0.5">Active Listings</p>
            </div>
            <div className="bg-nocturnal-surface-high/60 border border-nocturnal-border/40 px-4 py-3 rounded-xl text-center min-w-[90px]">
              <p className="text-xl font-bold text-rose-400 font-serif">{blocklistedUsers?.length || 0}</p>
              <p className="text-[9px] text-nocturnal-outline uppercase tracking-wider font-sans mt-0.5">Blocklist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Tabs Selector */}
      <div className="flex border-b border-nocturnal-border/20 gap-2 pb-px overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveAdminTab('users')}
          className={`pb-3 px-4 font-sans text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'users'
              ? 'border-primary-lavender text-primary-lavender'
              : 'border-transparent text-nocturnal-outline hover:text-on-surface'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage User Accounts ({filteredUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('books')}
          className={`pb-3 px-4 font-sans text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'books'
              ? 'border-primary-lavender text-primary-lavender'
              : 'border-transparent text-nocturnal-outline hover:text-on-surface'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Book Listings ({filteredBooks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('blocklist')}
          className={`pb-3 px-4 font-sans text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 shrink-0 ${
            activeAdminTab === 'blocklist'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-nocturnal-outline hover:text-rose-400/80'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>Blocklist Directory ({filteredBlocklist.length})</span>
        </button>
      </div>

      {/* Admin Content Panels */}
      <div>
        <AnimatePresence mode="wait">
          {activeAdminTab === 'users' && (
            <motion.div
              key="users-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Filter controls */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nocturnal-outline" />
                <input
                  type="text"
                  placeholder="Search user accounts by name, email, or region..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full bg-nocturnal-surface-low border border-nocturnal-border rounded-xl pl-10 pr-4 h-11 text-xs font-sans text-on-surface focus:outline-none focus:border-primary-lavender hover:border-nocturnal-border-high transition-colors"
                />
              </div>

              {/* Users Grid */}
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-nocturnal-outline border border-dashed border-nocturnal-border rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Users className="w-8 h-8 text-nocturnal-border" />
                  <p className="text-xs font-medium">No system user accounts match your term.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((u) => {
                    const isCurrentUser = u.email === user.email;
                    const actionId = `user-${u.uid}`;
                    const isLoading = isActionLoading === actionId;

                    return (
                      <div 
                        key={u.uid} 
                        className="bg-nocturnal-surface-low border border-nocturnal-border hover:border-nocturnal-border-high rounded-xl p-5 flex flex-col justify-between gap-4 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <img
                              src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                              alt={u.name}
                              className="w-12 h-12 rounded-full object-cover border border-nocturnal-border shrink-0"
                            />
                            <div className="space-y-0.5">
                              <h4 className="font-serif text-sm font-bold text-on-surface flex items-center gap-1.5">
                                {u.name}
                                {isCurrentUser && (
                                  <span className="text-[9px] font-sans px-1.5 py-0.5 bg-primary-lavender/25 text-primary-lavender rounded uppercase font-bold tracking-wider">
                                    YOU / ADMIN
                                  </span>
                                )}
                                {u.isTrusted && (
                                  <span className="text-[9px] font-sans px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded uppercase font-bold tracking-wider">
                                    TRUSTED
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-nocturnal-outline font-sans truncate max-w-[180px] sm:max-w-xs">{u.email || "No email"}</p>
                              <p className="text-[10px] text-nocturnal-muted font-sans flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-nocturnal-outline" /> {u.location || "Earth"}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs text-primary-lavender font-bold">
                              {u.swaps === 0 ? "No rating" : `⭐ ${u.rating}`}
                            </div>
                            <div className="text-[9px] text-nocturnal-outline uppercase tracking-wider font-sans mt-0.5">
                              {u.swaps} swaps completed
                            </div>
                          </div>
                        </div>

                        {/* Interactive Management Triggers */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-nocturnal-border/20">
                          {/* Toggle Trust Badge */}
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleAction(actionId, () => onToggleTrustUser(u.uid, u.isTrusted || false))}
                            className={`px-3 py-1.5 rounded-lg border font-sans text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer ${
                              u.isTrusted
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-nocturnal-surface hover:bg-nocturnal-surface-high text-nocturnal-outline hover:text-on-surface border-nocturnal-border'
                            }`}
                          >
                            {u.isTrusted ? (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Revoke Trust</span>
                              </>
                            ) : (
                              <>
                                <ShieldAlert className="w-3.5 h-3.5 text-nocturnal-outline" />
                                <span>Verify Seller</span>
                              </>
                            )}
                          </button>

                          {/* Delete Account */}
                          {confirmingDeleteUserUid !== u.uid ? (
                            <button
                              type="button"
                              disabled={isCurrentUser || isLoading}
                              onClick={() => setConfirmingDeleteUserUid(u.uid)}
                              className={`px-3 py-1.5 rounded-lg font-sans text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                isCurrentUser
                                  ? 'opacity-30 cursor-not-allowed bg-nocturnal-surface border border-nocturnal-border/30 text-nocturnal-outline'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Delete Account</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => {
                                  handleAction(actionId, async () => {
                                    await onDeleteUser(u.uid);
                                    setConfirmingDeleteUserUid(null);
                                  });
                                }}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-sans text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDeleteUserUid(null)}
                                className="px-2 py-1 bg-nocturnal-surface border border-nocturnal-border/60 text-nocturnal-outline font-sans text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeAdminTab === 'books' && (
            <motion.div
              key="books-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Filter controls */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nocturnal-outline" />
                <input
                  type="text"
                  placeholder="Search listed books by title, author, category, or seller..."
                  value={bookSearchTerm}
                  onChange={(e) => setBookSearchTerm(e.target.value)}
                  className="w-full bg-nocturnal-surface-low border border-nocturnal-border rounded-xl pl-10 pr-4 h-11 text-xs font-sans text-on-surface focus:outline-none focus:border-primary-lavender hover:border-nocturnal-border-high transition-colors"
                />
              </div>

              {/* Books list */}
              {filteredBooks.length === 0 ? (
                <div className="py-12 text-center text-nocturnal-outline border border-dashed border-nocturnal-border rounded-2xl flex flex-col items-center justify-center gap-2">
                  <BookOpen className="w-8 h-8 text-nocturnal-border" />
                  <p className="text-xs font-medium">No book listings match your term.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBooks.map((b) => {
                    const actionId = `book-${b.id}`;
                    const isLoading = isActionLoading === actionId;

                    return (
                      <div 
                        key={b.id} 
                        className="bg-nocturnal-surface-low border border-nocturnal-border hover:border-nocturnal-border-high rounded-xl overflow-hidden flex flex-col justify-between transition-all"
                      >
                        <div className="p-4 flex gap-3">
                          <img
                            src={b.images?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=150'}
                            alt={b.title}
                            className="w-16 h-20 rounded object-cover border border-nocturnal-border shrink-0 shadow-sm"
                          />
                          <div className="space-y-1 min-w-0">
                            <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-primary-lavender bg-primary-lavender/10 px-2 py-0.5 rounded">
                              {b.category}
                            </span>
                            <h4 className="font-serif text-xs font-bold text-on-surface truncate pr-1">
                              {b.title}
                            </h4>
                            <p className="text-[10px] text-nocturnal-outline font-sans truncate">
                              By {b.author}
                            </p>
                            <p className="text-[11px] font-mono text-primary-lavender font-bold mt-1">
                              ₹{b.price}
                            </p>
                            <p className="text-[9px] text-nocturnal-muted font-sans truncate flex items-center gap-1 mt-1">
                              Seller: <span className="text-on-surface font-semibold">{b.seller?.name || "Seed System"}</span>
                              {b.seller?.isTrusted && (
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1 py-0.2 rounded font-bold uppercase tracking-wide">T</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 py-2 bg-nocturnal-surface border-t border-nocturnal-border/20 flex items-center justify-between">
                          <span className="text-[9px] text-nocturnal-muted font-sans">
                            ID: {b.id.substring(0, 14)}...
                          </span>
                          {confirmingDeleteBookId !== b.id ? (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => setConfirmingDeleteBookId(b.id)}
                              className="text-red-400 hover:text-red-300 font-sans text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Listed Book</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => {
                                  handleAction(actionId, async () => {
                                    await onDeleteBook(b.id);
                                    setConfirmingDeleteBookId(null);
                                  });
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-sans text-[9px] font-bold uppercase rounded cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDeleteBookId(null)}
                                className="px-2 py-0.5 bg-nocturnal-surface border border-nocturnal-border text-nocturnal-outline font-sans text-[9px] font-bold uppercase rounded cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeAdminTab === 'blocklist' && (
            <motion.div
              key="blocklist-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Filter controls */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nocturnal-outline" />
                <input
                  type="text"
                  placeholder="Search blocklisted accounts by name, email, or region..."
                  value={blocklistSearchTerm}
                  onChange={(e) => setBlocklistSearchTerm(e.target.value)}
                  className="w-full bg-nocturnal-surface-low border border-nocturnal-border rounded-xl pl-10 pr-4 h-11 text-xs font-sans text-on-surface focus:outline-none focus:border-rose-500 hover:border-nocturnal-border-high transition-colors"
                />
              </div>

              {/* Blocklisted accounts grid */}
              {filteredBlocklist.length === 0 ? (
                <div className="py-12 text-center text-nocturnal-outline border border-dashed border-nocturnal-border rounded-2xl flex flex-col items-center justify-center gap-2">
                  <UserX className="w-8 h-8 text-rose-500/40" />
                  <p className="text-xs font-medium">No accounts in the blocklist.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBlocklist.map((u) => {
                    const actionId = `block-${u.uid}`;
                    const isLoading = isActionLoading === actionId;

                    return (
                      <div 
                        key={u.uid} 
                        className="bg-nocturnal-surface-low border border-nocturnal-border hover:border-rose-950/20 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <img
                              src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                              alt={u.name}
                              className="w-12 h-12 rounded-full object-cover border border-rose-500/20 grayscale shrink-0"
                            />
                            <div className="space-y-0.5">
                              <h4 className="font-serif text-sm font-bold text-rose-300 flex items-center gap-1.5">
                                {u.name}
                                <span className="text-[9px] font-sans px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded uppercase font-bold tracking-wider">
                                  BLOCKED
                                </span>
                              </h4>
                              <p className="text-[11px] text-nocturnal-outline font-sans truncate max-w-[180px] sm:max-w-xs">{u.email || "No email"}</p>
                              {u.deletedAt && (
                                <p className="text-[9px] text-rose-400/60 font-sans">
                                  Blocked on: {new Date(u.deletedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Restoration and Permanent Deletion triggers */}
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-nocturnal-border/20">
                          {confirmingUnblockUserUid !== u.uid ? (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => setConfirmingUnblockUserUid(u.uid)}
                              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-sans text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore Account</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => {
                                  handleAction(actionId, async () => {
                                    await onUnblockUser(u.uid, u);
                                    setConfirmingUnblockUserUid(null);
                                  });
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Confirm Restore
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingUnblockUserUid(null)}
                                className="px-2 py-1 bg-nocturnal-surface border border-nocturnal-border text-nocturnal-outline font-sans text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {confirmingPermanentDeleteUid !== u.uid ? (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => setConfirmingPermanentDeleteUid(u.uid)}
                              className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/5 hover:bg-red-500/15 text-red-400 font-sans text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Permanently</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => {
                                  handleAction(actionId, async () => {
                                    await onDeleteBlocklistUserPermanently(u.uid);
                                    setConfirmingPermanentDeleteUid(null);
                                  });
                                }}
                                className="px-2 py-1 bg-rose-700 hover:bg-rose-600 text-white font-sans text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Confirm Permanent Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingPermanentDeleteUid(null)}
                                className="px-2 py-1 bg-nocturnal-surface border border-nocturnal-border text-nocturnal-outline font-sans text-[9px] font-bold uppercase rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
