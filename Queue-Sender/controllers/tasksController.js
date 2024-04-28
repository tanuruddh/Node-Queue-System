import catchAsync from "../utils/catchAsnyc.js";
import authController from './authController.js'

const { queueManager } = authController;
const twoTasks = catchAsync(async (req, res, next) => {
    await queueManager.insertTaskForUser(req.user.email, "photo Processing1")
    await queueManager.insertTaskForUser(req.user.email, "photo Processing2")
    res.status(200).json({
        status: "success"
    })
})

const threeTasks = catchAsync(async (req, res, next) => {
    await queueManager.insertTaskForUser(req.user.email, "email Sending")
    res.status(200).json({
        status: "success"
    })
})

export default {
    twoTasks,
    threeTasks
}