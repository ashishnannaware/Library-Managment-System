/**
 * Mongoose plugin for soft delete functionality
 * Adds deletedAt field and soft delete methods to schemas
 */
export default function softDeletePlugin(schema) {
  // Add deletedAt field to schema
  schema.add({
    deletedAt: {
      type: Date,
      default: null
    }
  });

  // Add index for soft delete queries
  schema.index({ deletedAt: 1 });

  // Query helper to filter out deleted documents
  schema.query.notDeleted = function() {
    return this.where({ deletedAt: null });
  };

  // Instance method for soft delete
  schema.methods.softDelete = function() {
    this.deletedAt = new Date();
    return this.save();
  };

  // Instance method to restore soft deleted document
  schema.methods.restore = function() {
    this.deletedAt = null;
    return this.save();
  };

  // Static method to find non-deleted documents
  schema.statics.findActive = function(conditions = {}) {
    return this.find({ ...conditions, deletedAt: null });
  };

  // Static method to find deleted documents
  schema.statics.findDeleted = function(conditions = {}) {
    return this.find({ ...conditions, deletedAt: { $ne: null } });
  };
};

