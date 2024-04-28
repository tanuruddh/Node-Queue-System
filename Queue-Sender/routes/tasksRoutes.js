import express from "express";
import tasksConstroller from "../controllers/tasksController.js";
import authController from "../controllers/authController.js";

const { protect } = authController
const router = express.Router();
const { twoTasks, threeTasks } = tasksConstroller;

router.use(protect);
router.get('/two-tasks', twoTasks);
router.get('/three-tasks', threeTasks);
// router.get('/logout', logout);
// router.post('/forgotPassword', forgotPassword);
// router.patch('/resetPassword/:token', resetPassword);

// routes for getting information about the logged in user
// router.get('/me', protect, getMe, getUser);


export default router;