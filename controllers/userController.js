import User from '../models/User.js';
const createUser = async (req, res, next) => {

  try {
    const existingUserById = await User.findOne({ userId: req.body.userId, deletedAt: null });
    
    if (existingUserById) {
      return res.status(409).json({
        success: false,
        message: 'User with this User ID already exists'
      });
    }

    const existingUserByEmail = await User.findOne({ email: req.body.email, deletedAt: null });
    
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, userName, email } = req.query;
    
    // Build filter object
    const filter = { deletedAt: null };
    
    if (userName) {
      filter.userName = { $regex: userName, $options: 'i' };
    }
    
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
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

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    next(error);
  }
};

const getUserByUserId = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.userId, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate userId if userId is being updated
    if (req.body.userId && req.body.userId !== user.userId) {
      const existingUser = await User.findOne({ 
        userId: req.body.userId, 
        _id: { $ne: req.params.id },
        deletedAt: null 
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this User ID already exists'
        });
      }
    }

    // Check for duplicate email if email is being updated
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email, 
        _id: { $ne: req.params.id },
        deletedAt: null 
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Update user
    Object.assign(user, req.body);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Perform soft delete
    await user.softDelete();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    next(error);
  }
};

export {
  createUser,
  getUsers,
  getUserById,
  getUserByUserId,
  updateUser,
  deleteUser
};

