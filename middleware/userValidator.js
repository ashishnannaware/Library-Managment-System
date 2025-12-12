import Joi from 'joi';

const userSchema = Joi.object({
  userId: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    }),
  
  userName: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'User name is required',
      'any.required': 'User name is required'
    }),
  
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

const updateUserSchema = Joi.object({
  userId: Joi.string()
    .trim()
    .messages({
      'string.empty': 'User ID cannot be empty'
    }),
  
  userName: Joi.string()
    .trim()
    .messages({
      'string.empty': 'User name cannot be empty'
    }),
  
  email: Joi.string()
    .trim()
    .email()
    .messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Please provide a valid email address'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
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
  
  userName: Joi.string()
    .trim()
    .allow(''),
  
  email: Joi.string()
    .trim()
    .email()
    .allow('')
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
  userSchema,
  updateUserSchema,
  paginationSchema,
  validate,
  validateQuery,
};

