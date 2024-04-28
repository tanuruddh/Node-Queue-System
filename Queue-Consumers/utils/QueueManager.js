import dotenv from 'dotenv';
dotenv.config(".");
import amqp from 'amqplib';
import { EventEmitter } from 'events';
import catchAsync from './catchAsnyc.js'

class QueueConsumer extends EventEmitter {
    constructor() {
        super();
        this.connection = null;
        this.channels = null;
        this.queueListName = "queueList"

        this.connectToRabbitMQ();
    }

    connectToRabbitMQ = catchAsync(async () => {

        // Establish connection to RabbitMQ server
        this.connection = await amqp.connect(process.env.CLOUD_AMQP_URL);

        // Create channel
        this.channel = await this.connection.createChannel();
        console.log('Connected to RabbitMQ server. and Channel created.');
        this.consumeFromQueueList();
    })

    consumeFromQueueList = catchAsync(async () => {
        if (!this.connection) {
            throw new Error('RabbitMQ connection not established.');
        }

        await this.channel.assertQueue(this.queueListName, {
            durable: true,

        });

        console.log(`Consuming messages from queue: ${this.queueListName}`);

        this.channel.consume(this.queueListName, async (msg) => {
            const message = JSON.parse(msg.content.toString());
            if (msg !== null) {
                if (message.type === 'insert') {
                    await this.consumeFromQueue(message.queueName);
                    console.log(`start consuming messages from queue: ${message.queueName}`);

                }
                else if (message.type === 'delete') {
                    await this.channel.cancel(message.queueName);
                    console.log(`Stopped consuming messages from queue: ${message.queueName}`);
                }
                // Process the message here
                this.channel.ack(msg);
            }
        });
    })


    async consumeFromQueue(queueName) {
        try {
            if (!this.connection) {
                throw new Error('RabbitMQ connection not established.');
            }

            await this.channel.assertQueue(queueName, {
                durable: true,
                exclusive: false,
                autoDelete: true,
                messageTtl: 60000,
                maxLength: 1000,
                deadLetterExchange: 'myDLX',
            });

            console.log(`Consuming messages from queue: ${queueName}`);

            this.channel.consume(queueName, (msg) => {
                if (msg !== null) {
                    console.log(`Received message from ${queueName} :`, msg.content.toString());
                    // Process the message here
                    this.channel.ack(msg);
                }
            });

            // this.channels.set(queueName, channel);
        } catch (error) {
            console.error(`Error consuming from queue ${queueName}:`, error);
            this.emit('error', error);
        }
    }
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
        await this.closeConnection();
        // Any additional cleanup logic
    }


}

export default QueueConsumer;