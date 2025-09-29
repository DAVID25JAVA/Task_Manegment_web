// routes/taskRoutes.js
import express from "express";
import {
  getTasks,
  updateTask,
  deleteTask,
  createTask,
  getTaskById,
} from "../controllers/TaskController.js";

const TaskrRouter = express.Router();

TaskrRouter.get("/get-tasks", getTasks);
TaskrRouter.post("/create-tasks", createTask);
TaskrRouter.put("/update-tasks/:id", updateTask);
TaskrRouter.delete("/delete-tasks/:id", deleteTask);
TaskrRouter.get("/getById/:id", getTaskById)

export default  TaskrRouter;
