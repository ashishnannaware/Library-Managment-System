import mongoose from 'mongoose';
import softDelete from '../utils/softDelete.js';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    index: true
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    min: [1000, 'Published year must be a valid year'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  availabilityStatus: {
    type: String,
    enum: ['Available', 'Borrowed'],
    default: 'Available',
    required: true
  }
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text' });

bookSchema.plugin(softDelete);

export default mongoose.model('Book', bookSchema);

