import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.index({ deletedAt: 1 });

userSchema.query.notDeleted = function() {
  return this.where({ deletedAt: null });
};

userSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

userSchema.statics.findActive = function(conditions = {}) {
  return this.find({ ...conditions, deletedAt: null });
};

export default mongoose.model('User', userSchema);

