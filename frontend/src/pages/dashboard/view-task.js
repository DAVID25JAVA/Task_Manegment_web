import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  ChartNoAxesColumn,
  CheckCircle,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import API from "@/services/Api";
import Loader from "@/component/Loader";

export default function ViewTask() {
  const router = useRouter();
  const id = router?.query?.id;
  const [taskData, setTaskData] = useState([]);

  useEffect(() => {
    if (id) fetchTaskById(id);
  }, [id]);

  const fetchTaskById = async (id) => {
    try {
      const taskData = await API("get", `task/getById/${id}`);
      console.log(taskData);
      setTaskData(taskData?.task);
    } catch (error) {
      toast.error(error?.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate || taskData[0].completed) return false;
    return new Date(dueDate) < new Date();
  };

  if (!taskData) {
    return <Loader />;
  }

  return (
    <>
       <button
            onClick={() => router.push("/dashboard/tasklist")}
            className="flex p-5 items-center bg-gray-100 h-2 hover:bg-gray-200 cursor-pointer px-5 m-2 rounded-full gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tasks
          </button>
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
          </div>
        </div>

        {/* Task Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Task Content */}
          <div className="p-6">
            {taskData?.map((taskData) => {
              return (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {taskData.title}
                    </h2>

                    {taskData.description && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-2">
                          <FileText className="w-5 h-5" />
                          <span className="font-medium">Description</span>
                        </div>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
                          {taskData.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Due Date */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="font-medium text-gray-900">
                          {taskData.dueDate
                            ? formatDate(taskData.dueDate)
                            : "No due date"}
                        </p>
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <ChartNoAxesColumn className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p
                          className={`font-medium  text-[11px] text-gray-900 ${
                            taskData?.completed
                              ? "bg-green-200 text-green-500 px-2 py-[1px] rounded-full"
                              : "bg-yellow-200 text-yellow-500 px-2 py-[1px] rounded-full "
                          }`}
                        >
                          {taskData?.completed ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </div>

                    {/* Created At */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Clock className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">
                          {taskData.createdAt
                            ? formatDate(taskData.createdAt)
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => alert("Toggle complete clicked")}
                      className={`flex items-center gap-2 w-full justify-center py-3 px-4 rounded-lg font-medium transition ${
                        taskData.completed
                          ? " bg-green-500 text-white hover:bg-green-600"
                          : " bg-yellow-200 text-yellow-600  "
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      {taskData.completed
                        ? "Mark as Completed"
                        : "Mark as Pending"}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Metadata */}

            {/* Toggle Complete Button */}
          </div>
        </div>

        {/* Additional Info */}
      </div>
    </div>
    </>
  );
}
