const globalErrorHandler = (err,req,res,next)=>{
    const message = err.message || 'Internal Server Error';
    const stack = err.stack;
    const statusCode = err.statusCode ? err.statusCode : 500;

    res.status(statusCode).json(
        {
            status : "Failed",
            message,
            stack
        }
    );
    next();
};

module.exports = globalErrorHandler;