import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from 'xss-clean'
import hpp from "hpp";
import cookieParser from 'cookie-parser';
import client from 'prom-client';
import responseTime from 'response-time';


import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utils/appError.js";
import QueueConsumer from './utils/QueueManager.js';

const queueConsumer = new QueueConsumer();
const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// for making __dirname directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// for serve static files
app.use(express.static(path.join(__dirname, 'public')));

// fro secure Express apps by setting HTTP response headers.
app.use(helmet());

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

const reqResTime = new client.Histogram({
    name: "http_express_req_res_time",
    help: "This tells how much time is taken by req and res",
    labelNames: ["method", "route", "status_code"],
    bucketš: [1, 50, 100, 200, 400, 500, 800, 1000, 2000],
})

app.use(
    responseTime((req, res, time) => {
        reqResTime
            .labels({
                method: req.method,
                route: req.url,
                status_code: res.statusCode,
            })
            .observe(time);
    })

);
// Routes
app.get('/', (req, res, next) => {
    return res.status(200).send("Hi, I am a Consumer and am live ");
})

app.get('/metrics', async (req, res, next) => {
    res.setHeader('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics)
})

// Default Routes
app.all('*', (req, res, next) => {
    next(new AppError(`can not find ${req.originalUrl} on this server`, 400))

})

// error handlers middleware
app.use(globalErrorHandler);

export default app;
