function errorHandler(err, req, res, next) {
    console.error(`[Error] ${err.stack}`);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Server Error',
    });
}

function notFoundError(req, res, next) {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
}

module.exports = { errorHandler, notFoundError };
