'use client';
import { motion } from 'framer-motion';
import { deleteTask, updateTask } from '@/actions/task';
import { useState, useEffect } from 'react';
import { 
  FiEdit, FiTrash, FiCheckSquare, FiSquare, FiCalendar, 
  FiFlag, FiStar, FiAlertTriangle, FiClock 
} from 'react-icons/fi'

export default function TaskItem({ task, setTasks }) {
  const [isEditing, setIsEditing] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);
  const [currentTask, setCurrentTask] = useState(task);


  useEffect(() => {
    setDueDate(new Date(currentTask.dueDate).toLocaleDateString());
    setIsCompleted(currentTask.isCompleted);
  }, [currentTask]);

  useEffect(() => {
    const parseDate = (dateString) => {
      try {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return isNaN(date) ? 'Invalid date' : date.toLocaleDateString();
      } catch {
        return 'Invalid date';
      }
    };
  
    setDueDate(parseDate(currentTask.dueDate));
    setIsCompleted(currentTask.isCompleted);
  }, [currentTask]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    completed: { opacity: 0.6, scale: 0.98 }
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-blue-100 text-blue-600'
  };



  const [priority, setPriority] = useState(
    Object.keys(priorityColors).includes(task.priority) 
      ? task.priority 
      : 'medium'
  );

  const handlePriorityChange = async () => {
    const newPriority = priority === 'high' ? 'medium' : 
                       priority === 'medium' ? 'low' : 'high';
    
    try {
      // Optimistic UI update
      setPriority(newPriority);
      setCurrentTask(prev => ({ ...prev, priority: newPriority }));

      // Update database
      const formData = new FormData();
      formData.set('priority', newPriority);
      const updatedTask = await updateTask(currentTask._id, formData);

      // Update parent state
      setTasks(prev => prev.map(t => 
        t._id === currentTask._id ? { ...t, priority: newPriority } : t
      ));
    } catch (error) {
      // Rollback on error
      setPriority(priority);
      setCurrentTask(prev => ({ ...prev, priority }));
      console.error('Priority update failed:', error);
    }
  };


    // Date comparison calculations
    const taskDueDate = new Date(currentTask.dueDate);
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    // Normalize dates to compare without time
    const normalizedTaskDueDate = new Date(
      taskDueDate.getFullYear(),
      taskDueDate.getMonth(),
      taskDueDate.getDate()
    );
    const normalizedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const isDueToday = normalizedTaskDueDate.getTime() === normalizedToday.getTime();
    const isOverdue = normalizedTaskDueDate < normalizedToday;
    const toggleCompletion = async () => {
      const newCompletionState = !isCompleted;
      try {
        // Optimistic update with previous state preservation
        setCurrentTask(prev => ({ ...prev, isCompleted: newCompletionState }));
        setTasks(prev => prev.map(t => 
          t._id === currentTask._id ? { ...t, isCompleted: newCompletionState } : t
        ));
    
        const formData = new FormData();
        formData.set('isCompleted', newCompletionState.toString());
        
        // Update server
        await updateTask(currentTask._id, formData);
      } catch (error) {
        // Rollback on error
        setCurrentTask(prev => ({ ...prev, isCompleted: !newCompletionState }));
        setTasks(prev => prev.map(t => 
          t._id === currentTask._id ? { ...t, isCompleted: !newCompletionState } : t
        ));
        console.error('Update failed:', error);
      }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const updatedTask = await updateTask(currentTask._id, formData);
      setCurrentTask(updatedTask);
      setTasks(prev => prev.map(t => 
        t._id === currentTask._id ? updatedTask : t
      ));
      setIsEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(currentTask._id);
      setTasks(prev => prev.filter(t => t._id !== currentTask._id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date) ? '' : date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };
  
  const calculateDueProgress = (dueDateString) => {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    
    // Set both dates to midnight for accurate day comparison
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(dueDate);
    end.setHours(0, 0, 0, 0);
    
    const total = end - start;
    const elapsed = now - start;
    
    if (total <= 0) return 100; // If due date is in past
    return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
  };


  return (
    <div className="border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white group">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          defaultValue={currentTask.title}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <textarea
          name="description"
          defaultValue={currentTask.description}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
          placeholder="Add description..."
        />
        <div className="relative">
          <input
            type="date"
            name="dueDate"
            min={minDate} // Prevent selecting past dates
            defaultValue={new Date(currentTask.dueDate).toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
      ) : (
<div className="space-y-3">
<motion.div
      variants={itemVariants}
      initial="hidden"
      animate={isCompleted ? "completed" : "visible"}
      className="border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800 group relative"
    >
          <div className="flex items-start gap-3">
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${priorityColors[priority]}`}>
            <FiFlag className="inline mr-1" /> {priority}
          </div>
            <button
              onClick={toggleCompletion}
              className={`mt-1 p-2 rounded-lg transition-all ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-transparent hover:bg-green-100'
              }`}
            >
              <FiCheckSquare size={20} />
            </button>
            <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-semibold ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'
              }`}>
                {currentTask.title}
              </h3>
                {task.starred && <FiStar className="text-yellow-400" />}
              </div>
              <div className="mt-2 space-y-1">
              {currentTask.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {currentTask.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FiCalendar />
                <span>Due: {dueDate}</span>
                {!isCompleted && (
                        <>
                          {isDueToday && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">
                              Complete by today
                            </span>
                          )}
                          {isOverdue && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                              Overdue
                            </span>
                          )}
                        </>
                      )}
                </div>
                </div>
            {/* Progress Indicator */}
            {!isCompleted && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all" 
                  style={{ width: `${calculateDueProgress(dueDate)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 ">
        <button
          onClick={handlePriorityChange}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiFlag className={`text-sm ${priorityColors[priority].split(' ')[0]}`} />
          <div className='text-white'>
          Change Priority
          </div>
        </button>
          
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <FiEdit size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FiTrash size={16} />
              Delete
            </button>
          </div>
          </motion.div>
          </div>
      )}
    </div>
  );
}