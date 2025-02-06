'use client';
import { useState } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import TaskItem from './TaskItem';
import StatsCard from './StatsCard';
import { useEffect } from 'react';

export default function TaskList({ initialTasks }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const filteredTasks = tasks.filter(task => {
    const title = task.title?.toLowerCase() || '';
    const description = task.description?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = title.includes(query) || description.includes(query);
    
    let matchesFilter = true;
    switch(filter) {
      case 'low' :
        matchesFilter = task.priority === 'low';
        break;
      case 'completed':
        matchesFilter = task.isCompleted;
        break;
      case 'high':
        matchesFilter = task.priority === 'high';
        break;
      case 'all':
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <StatsCard tasks={tasks} />
      
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 text-white"
        >
          <option value="all">All Tasks</option>
          <option value="completed">Completed</option>
          <option value="high">High Priority</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.map(task => (
          <TaskItem key={task._id} task={task} setTasks={setTasks} />
        ))}
      </div>
    </div>
  );
}