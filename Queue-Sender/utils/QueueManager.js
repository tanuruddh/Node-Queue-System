import dotenv from 'dotenv';
dotenv.config(".");
import amqp from 'amqplib';
import catchAsync from './catchAsnyc.js';
import Queues from '../models/queueModel.js';


class QueueManager {
    constructor() {
        this.idleQueues = new Map();
        this.connection = null;
        this.channel = null;
        this.queueList = null;
        this.queueListName = "queueList"


        this.connectToRabbitMQ();
    }

    getAllQueues = catchAsync(async () => {

        const queues = await Queues.find();
        if (queues.length > 0) {
            queues.forEach((queue) => {
                this.createQueueForUser(queue.queueName)
                this.idleQueues.set(queue.queueName, queue.queueName);
            })
        }


    })

    connectToRabbitMQ = catchAsync(async () => {

        // Establish connection to RabbitMQ server
        this.connection = await amqp.connect(process.env.CLOUD_AMQP_URL);
        console.log('Connected to RabbitMQ server.');

        // Create channel
        this.channel = await this.connection.createChannel();
        console.log('Channel created.');
        this.getAllQueues();
        this.createQueueForSendingNewUserQueueToConsumer();

    })

    createQueueForSendingNewUserQueueToConsumer = catchAsync(async () => {
        const queueName = "queueList"
        const options = {
            durable: true
        }

        this.queueList = await this.channel.assertQueue(queueName, options)
        console.log(`Queue '${queueName}' created successfully.`);

    })


    createQueueForUser = catchAsync(async (userEmail) => {
        if (!this.idleQueues.has(userEmail)) {
            const queueName = userEmail; // Example queue name
            const options = {
                durable: true,
                exclusive: false,
                autoDelete: true,
                messageTtl: 60000,
                maxLength: 1000,
                deadLetterExchange: 'myDLX',
            } // Example queue options

            const queue = await this.channel.assertQueue(queueName, options)

            console.log(`Queue '${queueName}' created successfully.`);
            const existingQueue = await Queues.findOne({ queueName });
            if (!existingQueue) await Queues.create({ queueName });
            this.insertTaskForUser(this.queueListName, { type: "insert", queueName });
            this.idleQueues.set(userEmail, queue);
        }
    })

    // Method to insert a task into the respective user's queue
    insertTaskForUser = catchAsync(async (queueName, task) => {

        if (this.idleQueues.has(queueName) || queueName === this.queueListName) {
            // const queue = this.idleQueues.get(queueName);
            this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(task)), { persistent: true });
            console.log('Task inserted into user queue:', task);
        } else {
            throw new Error(`User queue not found for user ID: ${queueName}`);
        }
    });


    sendToConsumerForCancelConsuming = catchAsync(async (queueName) => {
        this.insertTaskForUser(this.queueListName, { type: "delete", queueName });
    })


    async closeConnection() {
        try {
            if (this.connection) {
                await this.connection.close();
                console.log('RabbitMQ connection closed.');
            }
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }

    // Clean up resources when QueueManager instance is destroyed
    async destroy() {
        this.idleQueues.forEach(async (queue, key) => {
            await this.deleteQueue(queue);
        })
        await this.channel.cancel(this.queueListName);
        await this.closeConnection();
        // Any additional cleanup logic
    }


}


export default QueueManager;
