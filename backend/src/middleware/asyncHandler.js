/**
 * asyncHandler
 * ------------
 * Wraps any async controller/middleware function and forwards any thrown
 * error to Express's next(err) — so controllers NEVER need try/catch.
 *
 * Usage:
 *   router.get('/', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;