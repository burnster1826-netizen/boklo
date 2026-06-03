import { collection, doc, setDoc, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface EmailNotification {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  bookTitle: string;
  messageText: string;
  timestamp: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  subject: string;
}

/**
 * Triggers an email notification record in Firestore
 */
export async function triggerEmailNotification(params: {
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
  bookTitle: string;
  messageText: string;
}) {
  const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Clean up email or generate a fallback
  let emailAddr = params.recipientEmail;
  if (!emailAddr || !emailAddr.includes('@')) {
    const formattedName = params.recipientName.toLowerCase().replace(/\s+/g, '.');
    emailAddr = `${formattedName}@bookloop.in`;
  }

  const subject = `📬 [BookLoop] New message from ${params.senderName} regarding "${params.bookTitle}"`;

  const notification: EmailNotification = {
    id: notifId,
    senderId: params.senderId,
    senderName: params.senderName,
    recipientId: params.recipientId,
    recipientName: params.recipientName,
    recipientEmail: emailAddr,
    bookTitle: params.bookTitle,
    messageText: params.messageText,
    timestamp: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    status: 'Delivered',
    subject
  };

  try {
    await setDoc(doc(db, 'email_notifications', notifId), notification);
    console.log(`Email notification successfully dispatched and logged: ${notifId}`);
    return notification;
  } catch (error) {
    console.error("Failed to commit email notification log to Firestore:", error);
    return null;
  }
}

/**
 * Triggers a welcome/greeting email notification record in Firestore for newly registered users
 */
export async function triggerGreetingEmail(params: {
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
}) {
  const notifId = `notif-welcome-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  let emailAddr = params.recipientEmail;
  if (!emailAddr || !emailAddr.includes('@')) {
    const formattedName = params.recipientName.toLowerCase().replace(/\s+/g, '.');
    emailAddr = `${formattedName}@bookloop.in`;
  }

  const subject = `✨ Welcome to BookLoop, ${params.recipientName}!`;
  
  const welcomeMessage = `Hello ${params.recipientName},\n\nWelcome to BookLoop - India's Premier Local Used Book Peer-to-Peer Marketplace! We are absolutely thrilled to have you join our reading community.\n\nBookLoop helps you connect with fellow book lovers in your immediate vicinity, enabling secure and hassle-free used book sales, exchanges, and trades.\n\nHere are a few quick tips to get started:\n• 📚 List a Book: Snap a picture and put your books up for swap, sale, or trade!\n• 🔍 Explore Local: Filter listings nearby and pick them up at convenient local meeting points.\n• 💬 Chat Securely: Haggle, discuss book conditions, and agree on coordinates using our real-time messaging.\n\nHappy reading and loop-trading!\n\nWarmest regards,\nThe BookLoop Team`;

  const notification: EmailNotification = {
    id: notifId,
    senderId: 'system',
    senderName: 'The BookLoop Team',
    recipientId: params.recipientId,
    recipientName: params.recipientName,
    recipientEmail: emailAddr,
    bookTitle: 'Welcome to BookLoop Community',
    messageText: welcomeMessage,
    timestamp: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    status: 'Delivered',
    subject
  };

  try {
    await setDoc(doc(db, 'email_notifications', notifId), notification);
    console.log(`Welcome email successfully dispatched to Firestore: ${notifId}`);
    return notification;
  } catch (error) {
    console.error("Failed to dispatch welcome email: ", error);
    return null;
  }
}

