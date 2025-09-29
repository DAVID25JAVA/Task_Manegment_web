import { useState, useEffect } from "react";
import {
  CheckCircle,
  Trash2,
  Plus,
  Edit2,
  ListTodo,
  Search,
  Check,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "@/services/Api";
import { useRouter } from "next/router";

export default function TaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

   

  // Helper: Format date string to YYYY-MM-DD for input[type=date]
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchTasks = async () => {
    try {
      const data = await API("get", "task/get-tasks");
      setTasks(data?.tasks || []);
    } catch (error) {
      toast.error(error?.message);
      console.error("Error fetching tasks:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    // if (!newTitle.trim()) return;
    
    if (!newTitle || !newDescription || !newDueDate) {
      toast.error("Please fill all task")
      console.log("create task");
      return;
    }

    try {
      const task = await API("post", "task/create-tasks", {
        title: newTitle,
        description: newDescription,
        dueDate: newDueDate || null,
        completed: false,
      });
      toast.success(task?.message || "Task added");
      await fetchTasks();
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
    } catch (error) {
      toast?.error(error?.message);
      console.error("Error adding task:", error.message);
    }
  };

  const toggleComplete = async (_id, completed) => {
    try {
      const updated = await API("put", `task/update-tasks/${_id}`, {
        completed: !completed,
      });
      setTasks((prev) => prev.map((t) => (t.id === _id ? updated : t)));
      await fetchTasks();
    } catch (error) {
      console.error("Error toggling task:", error.message);
    }
  };

  const deleteTask = async (_id) => {
     
    try {
      const res = await API("delete", `task/delete-tasks/${_id}`);
      setTasks((prev) => prev.filter((t) => t._id !== _id));
      toast.success(res?.message || "Task deleted");
      await fetchTasks();
      setIsOpen(false)
    } catch (error) {
      toast.error(error?.message);
      console.error("Error deleting task:", error.message);
    }
  };

  const startEdit = (_id, title, description, dueDate) => {
    setEditingId(_id);
    setEditTitle(title);
    setEditDescription(description || "");
    // Fix: Format dueDate to YYYY-MM-DD for input value
    setEditDueDate(formatDateForInput(dueDate));
  };

  const saveEdit = async (_id) => {
    if (!editTitle.trim()) return;
    try {
      const updated = await API("put", `task/update-tasks/${_id}`, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate || null,
      });
      setTasks((prev) => prev.map((t) => (t._id === _id ? updated : t)));
      toast.success(updated?.message || "Task updated");
      await fetchTasks();
      setEditingId(null);
      setEditTitle("");
      setEditDescription("");
      setEditDueDate("");
    } catch (error) {
      toast.error(error?.message);
      console.error("Error editing task:", error.message);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  // Calculate overdue tasks
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  });

  // Filter tasks by search and status
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && task.completed) ||
      (filterStatus === "pending" && !task.completed) ||
      (filterStatus === "overdue" &&
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        !task.completed);

    return matchesSearch && matchesStatus;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if a date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };

  // Get status badge class based on task status
  const getStatusClass = (task) => {
    if (task.completed) return "bg-green-100 text-green-800 border-green-200";
    if (task.dueDate && new Date(task.dueDate) < new Date())
      return "bg-red-100 text-red-800 border-red-200";
    if (isToday(task.dueDate))
      return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  // Get status text
  const getStatusText = (task) => {
    if (task.completed) return "Completed";
    if (task.dueDate && new Date(task.dueDate) < new Date()) return "Overdue";
    if (isToday(task.dueDate)) return "Due Today";
    return "Pending";
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-orange-500" />
            My Tasks
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {completedCount}/{totalCount} tasks completed •{" "}
            {overdueTasks.length} overdue
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="flex items-center gap-2 flex-1 p-3 border rounded-lg bg-gray-50">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3  border font-semibold rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option className="bg-pink-500 text-white" value="all">
            All Tasks
          </option>
          <option className="bg-pink-500 text-white" value="completed">
            Completed
          </option>
          <option className="bg-pink-500 text-white" value="pending">
            Pending
          </option>
          <option className="bg-pink-500 text-white" value="overdue">
            Overdue
          </option>
        </select>
      </div>

      {/* Add Task Inputs */}
      <div className="flex flex-col gap-4 mb-6 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-100">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Task title *"
          className="bg-white text-black border-0 outline-none px-4 py-3 rounded-lg placeholder:text-black focus:ring-2 focus:ring-orange-500 transition"
        />
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Description *"
          className="bg-white text-black border-0 outline-none px-4 py-3 rounded-lg placeholder:text-black focus:ring-2 focus:ring-orange-500 transition"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 bg-white px-4 py-3 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="flex-1 bg-transparent outline-none text-black"
              placeholder="Due date *"
            />
          </div>
          <button
            onClick={addTask}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">
            No tasks found. Try changing your filters or add a new task!
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTasks.map((task) => {
            console.log(task?._id);
            return (
              <>
                <li
                  key={task._id}
                  className={`flex flex-col p-4 rounded-xl border transition-all duration-200 group ${
                    task.completed
                      ? "bg-green-50 border-green-200 hover:bg-green-100"
                      : "bg-gray-50 border-gray-200 hover:bg-pink-50 hover:border-pink-200"
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleComplete(task._id, task.completed)}
                      className={`p-2 rounded-lg transition-colors mt-1 ${
                        task.completed
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-white border-2 border-gray-300 hover:border-orange-500 text-gray-500 hover:text-orange-500"
                      }`}
                    >
                      <CheckCircle
                        className={`w-5 h-5 ${
                          task.completed ? "fill-current" : ""
                        }`}
                      />
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      {editingId === task._id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveEdit(task._id)
                            }
                            className="w-full bg-white px-3 py-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            autoFocus
                            placeholder="Edit title"
                          />
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && saveEdit(task._id)
                            }
                            className="w-full bg-white px-3 py-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Edit description (optional)"
                          />
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <input
                              type="date"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="bg-white px-3 py-2 text-black rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <span
                              className={`block font-medium pr-2 ${
                                task.completed
                                  ? "line-through text-gray-500"
                                  : "text-gray-900"
                              }`}
                            >
                              {task.title}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusClass(
                                task
                              )}`}
                            >
                              {getStatusText(task)}
                            </span>
                          </div>

                          {task.description && (
                            <p
                              className={`text-sm pr-2 ${
                                task.completed
                                  ? "line-through text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}

                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-sm mt-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span
                                className={`${
                                  task.dueDate &&
                                  new Date(task.dueDate) < new Date() &&
                                  !task.completed
                                    ? "text-red-500 font-medium"
                                    : "text-gray-500"
                                }`}
                              >
                                Due: {formatDate(task.dueDate)}
                                {isToday(task.dueDate) &&
                                  !task.completed &&
                                  " (Today)"}
                              </span>
                              {task.dueDate &&
                                new Date(task.dueDate) < new Date() &&
                                !task.completed && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4">
                    {editingId === task._id ? (
                      <button
                        onClick={() => saveEdit(task._id)}
                        className="flex items-center gap-1 px-3 py-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Save task"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          startEdit(
                            task._id,
                            task.title,
                            task.description,
                            task.dueDate
                          )
                        }
                        className="flex items-center gap-1 px-3 py-2 text-yellow-500 cursor-pointer hover:text-yellow-600 hover:bg-yellow-200 bg-yellow-100 rounded-lg transition"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(true)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-500 hover:text-red-600 hover:bg-red-200 rounded-lg transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/dashboard/view-task?id=${task?._id}`)
                      }
                      className="text-green-400 hover:text-green-500 bg-green-100 px-5 hover:bg-green-200 cursor-pointer py-2 rounded-lg"
                    >
                      View
                    </button>
                  </div>

                  {/* Dialog for delete task */}
                  {isOpen && (
                    <div className="fixed inset-0 flex items-center justify-center   bg-opacity-50 z-50">
                      <div className="bg-white rounded-xl shadow-lg p-6 w-80">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                          Confirm Delete
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to delete this task? This action
                          cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteTask(task?._id)}
                            className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              </>
            );
          })}
        </ul>
      )}
    </div>
  );
}
