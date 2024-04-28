import AppError from "../utils/appError.js";

const handleCasteErrorDB = (err) => {
    const message = `invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}
const handleJWTError = () => new AppError('Invalid token ,Please login again', 401);
const handleTokenExpiredError = () => new AppError('Your token expired ,Please login again', 401);

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}, Please use another value`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(ele => ele.message);

    const message = `Invalid input data. ${errors.map(".  ")}`;

    return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        stack: err.stack,
        message: err.message
    })
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        console.error('ERROR:', err);
    }

    return res.status(500).json({
        status: 'error',
        message: 'something went wrong'
    })
}


const globalErrorHandler = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (err.name === 'CastError') error = handleCasteErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'validationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

        sendErrorProd(error, res);
    }
}

export default globalErrorHandler;