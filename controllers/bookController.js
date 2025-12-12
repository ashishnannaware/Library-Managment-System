import Book from '../models/Book.js';
import { triggerWishlistNotifications } from '../services/notificationService.js';
const createBook = async (req, res, next) => {
  try {
    // Check for duplicate ISBN
    const existingBook = await Book.findOne({ isbn: req.body.isbn, deletedAt: null });
    
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, author, publishedYear } = req.query;
    
    // Build filter object
    const filter = { deletedAt: null };
    
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }
    
    if (publishedYear) {
      filter.publishedYear = parseInt(publishedYear);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [books, total] = await Promise.all([
      Book.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Book.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, deletedAt: null });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book retrieved successfully',
      data: book
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, deletedAt: null });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check for duplicate ISBN if ISBN is being updated
    if (req.body.isbn && req.body.isbn !== book.isbn) {
      const existingBook = await Book.findOne({ 
        isbn: req.body.isbn, 
        _id: { $ne: req.params.id },
        deletedAt: null 
      });
      
      if (existingBook) {
        return res.status(409).json({
          success: false,
          message: 'Book with this ISBN already exists'
        });
      }
    }

    // Track previous availability status for notification
    const previousStatus = book.availabilityStatus;
    const newStatus = req.body.availabilityStatus;

    // Update book
    Object.assign(book, req.body);
    await book.save();

    // Trigger asynchronous notification if status changed from "Borrowed" to "Available"
    if (previousStatus === 'Borrowed' && newStatus === 'Available') {
      triggerWishlistNotifications(book._id);
    }

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, deletedAt: null });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Perform soft delete
    await book.softDelete();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID'
      });
    }
    next(error);
  }
};

const searchBooks = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    
    // Build search filter with partial matching
    const searchFilter = {
      deletedAt: null,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } }
      ]
    };

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute search query with pagination
    const [books, total] = await Promise.all([
      Book.find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Book.countDocuments(searchFilter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: {
        books,
        query,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks
};


