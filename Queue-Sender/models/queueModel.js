import mongoose from "mongoose";


const queueSchema = new mongoose.Schema({
    queueName: {
        type: String,
        required: true,
        unique: true
    },

})

const Queues = mongoose.model("Queues", queueSchema);

export default Queues;