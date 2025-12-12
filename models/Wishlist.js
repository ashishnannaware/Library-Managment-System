import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required'],
    index: true
  }
}, {
  timestamps: true
});

wishlistSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);



