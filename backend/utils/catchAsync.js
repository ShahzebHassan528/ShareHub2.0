/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 * Eliminates need for try-catch blocks in routes
 */

/**
 * Wrap async function to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
