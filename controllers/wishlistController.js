import Wishlist from '../models/Wishlist.js';
import Book from '../models/Book.js';
import User from '../models/User.js';

const addToWishlist = async (req, res, next) => {
  try {
    const { userId, bookId } = req.body;

    const user = await User.findOne({ userId: userId, deletedAt: null });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const book = await Book.findOne({ _id: bookId, deletedAt: null });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const existingWishlist = await Wishlist.findOne({ userId, bookId });
    if (existingWishlist) {
      return res.status(409).json({
        success: false,
        message: 'Book is already in wishlist'
      });
    }

    const wishlist = new Wishlist({ userId, bookId });
    await wishlist.save();

    res.status(201).json({
      success: true,
      message: 'Book added to wishlist successfully',
      data: wishlist
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
        message: 'Book is already in wishlist'
      });
    }
    next(error);
  }
};

const getUserWishlist = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId: userId, deletedAt: null });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const wishlists = await Wishlist.find({ userId })
      .populate('bookId', 'title author isbn publishedYear availabilityStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        userId,
        wishlist: wishlists
      }
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { userId, bookId } = req.params;

    const wishlist = await Wishlist.findOne({ userId, bookId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in wishlist'
      });
    }

    await Wishlist.deleteOne({ _id: wishlist._id });

    res.status(200).json({
      success: true,
      message: 'Book removed from wishlist successfully'
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

const checkWishlist = async (req, res, next) => {
  try {
    const { userId, bookId } = req.query;

    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'userId and bookId are required'
      });
    }

    const wishlist = await Wishlist.findOne({ userId, bookId });

    res.status(200).json({
      success: true,
      data: {
        isInWishlist: !!wishlist,
        wishlist: wishlist || null
      }
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

const getAllWishlists = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, userId, bookId } = req.query;

    const filter = {};
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (bookId) {
      filter.bookId = bookId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const wishlists = await Wishlist.find(filter)
      .populate('bookId', 'title author isbn publishedYear availabilityStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Wishlist.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Wishlists retrieved successfully',
      data: {
        wishlists,
        pagination: {
          page: parseInt(page),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
  checkWishlist,
  getAllWishlists
};

