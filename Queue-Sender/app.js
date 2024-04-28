import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from "express";
// import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from 'xss-clean'
import hpp from "hpp";
import cookieParser from 'cookie-parser';

import globalErrorHandler from "./controllers/errorController.js";
import userRoutes from "./routes/userRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import AppError from "./utils/appError.js";

const app = express();

// for making __dirname directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// for serve static files
app.use(express.static(path.join(__dirname, 'public')));

// fro secure Express apps by setting HTTP response headers.
app.use(helmet());

// for limiting repeated requests to API
// const limiter = rateLimit({
//     max: 100,
//     windowMs: 15 * 60 * 1000,
//     message: "Too many requests from this IP, please try again later"
// })
// app.use(limiter);

// for adding body to req
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//for sanitize user input
app.use(mongoSanitize());

// to prevent Cross Site Scripting (XSS) attack
app.use(xss());

//to protect against HTTP Parameter Pollution attacks
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// Routes

app.get('/', (req, res, next) => {
    return res.status(200).send("Hi, I am live ");
})


app.use('/api/v1/users', userRoutes);
app.use('/api/v1/addtasks', tasksRoutes);

// Default Routes
app.all('*', (req, res, next) => {
    next(new AppError(`can not find ${req.originalUrl} on this server`, 400))

})

// error handlers middleware
app.use(globalErrorHandler);

export default app;
