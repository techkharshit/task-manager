// app/page.js
import TaskList from '../../components/TaskList';
import CreateTaskForm from '../../components/CreateTaskForm';
import connectDB from '../../lib/db';
import Task from '../../models/Task';

export default async function Home() {
  await connectDB();
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();

  return (
    <main className="container mx-auto p-4 ">
      <h1 className="text-3xl font-bold mb-8">Task Manager</h1>
      <CreateTaskForm />
      <TaskList initialTasks={JSON.parse(JSON.stringify(tasks))} />
    </main>
  );
}