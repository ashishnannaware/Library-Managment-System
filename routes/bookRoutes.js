import express from 'express';
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
} from '../controllers/bookController.js';
import {
  bookSchema,
  updateBookSchema,
  searchSchema,
  paginationSchema,
  validate,
  validateQuery,
} from '../middleware/bookValidator.js';

const router = express.Router();

// Create a new book
router.post('/', validate(bookSchema), createBook);

// Get paginated list of books with optional filters
router.get('/', validateQuery(paginationSchema), getBooks);

// Search books by title or author
router.get('/search', validateQuery(searchSchema), searchBooks);

// Get a single book by ID
router.get('/:id', getBookById);

// Update a book
router.put('/:id', validate(updateBookSchema), updateBook);

// Soft delete a book
router.delete('/:id', deleteBook);

export default router;

