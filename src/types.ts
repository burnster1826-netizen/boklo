/**
 * BookLoop App Type Definitions
 */

export interface Seller {
  name: string;
  avatar: string;
  rating: number;
  swaps: number;
  isTrusted?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  category: string;
  subcategory?: string;
  condition: 'Like New' | 'Very Good' | 'Well-Loved';
  conditionDetails?: string;
  location: string;
  distance: number; // in kilometres
  images: string[];
  seller: Seller;
  isLiked?: boolean;
  language?: string;
  pages?: number;
  synopsis?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  isMeetingPoint?: boolean;
  meetingLocation?: string;
  image?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatSession {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    unreadCount: number;
    isOnline: boolean;
  };
  book: {
    id: string;
    title: string;
    price: number;
    cover: string;
  };
  messages: Message[];
}

export interface UserProfile {
  name: string;
  email?: string;
  avatar: string;
  location: string;
  isLocationGranted: boolean;
  customLocationName?: string;
  rating: number;
  swaps: number;
  readingPersona: {
    title: string;
    genres: string[];
  };
  likedBookIds: string[];
}
