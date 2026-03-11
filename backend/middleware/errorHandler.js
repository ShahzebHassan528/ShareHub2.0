/**
 * Global Error Handling Middleware
 * Centralized error handling for the entire application
 */

const AppError = require('../utils/AppError');

/**
 * Handle Sequelize Validation Errors
 * @param {Error} err - Sequelize validation error
 * @returns {AppError} Formatted application error
 */
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(e => e.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle Sequelize Unique Constraint Errors
 * @param {Error} err - Sequelize unique constraint error
 * @returns {AppError} Formatted application error
 */
const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0].path;
  const value = err.errors[0].value;
  const message = `Duplicate value for ${field}: '${value}'. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle Sequelize Foreign Key Constraint Errors
 * @param {Error} err - Sequelize foreign key error
 * @returns {AppError} Formatted application error
 */
const handleSequelizeForeignKeyError = (err) => {
  const message = 'Invalid reference. The referenced record does not exist.';
  return new AppError(message, 400);
};

/**
 * Handle Sequelize Database Connection Errors
 * @param {Error} err - Sequelize connection error
 * @returns {AppError} Formatted application error
 */
const handleSequelizeConnectionError = (err) => {
  const message = 'Database connection failed. Please try again later.';
  return new AppError(message, 503);
};

/**
 * Handle JWT Errors
 * @param {Error} err - JWT error
 * @returns {AppError} Formatted application error
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT Expired Errors
 * @param {Error} err - JWT expired error
 * @returns {AppError} Formatted application error
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Handle Cast Errors (Invalid ID format)
 * @param {Error} err - Cast error
 * @returns {AppError} Formatted application error
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Send error response in development mode
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

/**
 * Send error response in production mode
 * @param {Error} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  } 
  // Programming or unknown error: don't leak error details
  else {
    // Log error for debugging
    console.error('ERROR 💥', err);
    
    // Send generic message
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }
};

/**
 * Global Error Handler Middleware
 * Must be registered as the LAST middleware in server.js
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    
    // Handle specific error types
    if (error.name === 'SequelizeValidationError') {
      error = handleSequelizeValidationError(error);
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      error = handleSequelizeUniqueConstraintError(error);
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      error = handleSequelizeForeignKeyError(error);
    }
    
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      error = handleSequelizeConnectionError(error);
    }
    
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    
    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 Not Found Errors
 * Use this before the global error handler
 */
const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(err);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
