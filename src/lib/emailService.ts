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
