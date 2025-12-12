import Joi from 'joi';

const bookSchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Title is required',
      'any.required': 'Title is required'
    }),
  
  author: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Author is required',
      'any.required': 'Author is required'
    }),
  
  isbn: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'ISBN is required',
      'any.required': 'ISBN is required'
    }),
  
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.base': 'Published year must be a number',
      'number.min': 'Published year must be a valid year',
      'number.max': 'Published year cannot be in the future',
      'any.required': 'Published year is required'
    }),
  
  availabilityStatus: Joi.string()
    .valid('Available', 'Borrowed')
    .default('Available')
    .messages({
      'any.only': 'Availability status must be either "Available" or "Borrowed"'
    })
});

const updateBookSchema = Joi.object({
  title: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Title cannot be empty'
    }),
  
  author: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Author cannot be empty'
    }),
  
  isbn: Joi.string()
    .trim()
    .messages({
      'string.empty': 'ISBN cannot be empty'
    }),
  
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .messages({
      'number.base': 'Published year must be a number',
      'number.min': 'Published year must be a valid year',
      'number.max': 'Published year cannot be in the future'
    }),
  
  availabilityStatus: Joi.string()
    .valid('Available', 'Borrowed')
    .messages({
      'any.only': 'Availability status must be either "Available" or "Borrowed"'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const searchSchema = Joi.object({
  query: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Search query is required',
      'any.required': 'Search query is required'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
});

const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  
  author: Joi.string()
    .trim()
    .allow(''),
  
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .allow('')
    .messages({
      'number.base': 'Published year must be a number',
      'number.min': 'Published year must be a valid year',
      'number.max': 'Published year cannot be in the future'
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

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
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

    req.query = value;
    next();
  };
};

export {
  bookSchema,
  updateBookSchema,
  searchSchema,
  paginationSchema,
  validate,
  validateQuery,
};

