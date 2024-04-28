import dotenv from 'dotenv';
dotenv.config(".");
import mongoose from 'mongoose';
import app from './app.js';
import QueueManager from './utils/QueueManager.js';
import cluster from 'cluster'
import os from 'os';

const numCPUs = os.cpus().length;



if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    console.log(`Worker ${process.pid} started`);

    process.on('uncaughtException', (err) => {
        console.log(err.name, err.message);
        process.exit(1);
    });

    // mongoose.connect("mongodb+srv://Quiz_user:BAALxFJgzw0gJMTC@cluster0.h5iid1p.mongodb.net/queueSystem?retryWrites=true&w=majority").then((con) => console.log('connected to database'))

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`Server ${process.pid} listening on port ${port}`);
    });

    process.on('unhandledRejection', (err) => {
        console.log(err.name, err.message);
        // process.exit(1);
    });

    process.on('exit', async () => {
        await QueueManager.destroy();
        console.log('Application exited gracefully.');
    });
}

// const DB = process.env.DATABASE;
// process.env.DATABASE.replace(
//     '<PASSWORD>',
//     process.env.DATABASE_PASSWORD,
// );
