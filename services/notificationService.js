import Wishlist from '../models/Wishlist.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { sendWishlistFulfillmentEmail } from './emailService.js';
const processWishlistNotifications = async (bookId) => {
  try {
    const book = await Book.findOne({ _id: bookId, deletedAt: null });
    
    if (!book) {
      console.log(`Book with ID ${bookId} not found for notification processing`);
      return;
    }

    if (book.availabilityStatus !== 'Available') {
      console.log(`Book "${book.title}" is not available (status: ${book.availabilityStatus}), skipping notifications`);
      return;
    }

    const wishlists = await Wishlist.find({ bookId: bookId });

    if (wishlists.length === 0) {
      console.log(`No wishlist entries found for book: ${book.title}`);
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const wishlist of wishlists) {
      try {
        const user = await User.findOne({ 
          userId: wishlist.userId, 
          deletedAt: null 
        });

        if (!user) {
          console.log(`User with userId ${wishlist.userId} not found, skipping notification`);
          failureCount++;
          continue;
        }

        const notificationMessage = `Notification prepared for user_id: ${wishlist.userId}: Book [${book.title}] is now available.`;
        console.log(notificationMessage);

        await sendWishlistFulfillmentEmail(
          user.email,
          user.userName,
          book.title,
          book.author
        );

        successCount++;
        console.log(`Email sent successfully to ${user.email} for book: ${book.title}`);
      } catch (error) {
        failureCount++;
        console.error(`Failed to send notification to user_id ${wishlist.userId}:`, error.message);
      }
    }

    console.log(`\n=== Notification Summary ===`);
    console.log(`Total wishlist entries: ${wishlists.length}`);
    console.log(`Successful notifications: ${successCount}`);
    console.log(`Failed notifications: ${failureCount}`);
    console.log(`Book: ${book.title}`);
    console.log(`============================\n`);
  } catch (error) {
    console.error('Error processing wishlist notifications:', error);
    // In production, you might want to log this to an error tracking service
  }
};

const triggerWishlistNotifications = (bookId) => {
  setImmediate(() => {
    processWishlistNotifications(bookId).catch(error => {
      console.error('Failed to process wishlist notifications:', error);
    });
  });
};

export {
  triggerWishlistNotifications,
  processWishlistNotifications
};


