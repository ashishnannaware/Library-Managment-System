import Joi from 'joi';

const addWishlistSchema = Joi.object({
  userId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    }),
  
  bookId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Book ID is required',
      'any.required': 'Book ID is required'
    })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

export {
  addWishlistSchema,
  validate
};

