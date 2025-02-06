// app/page.js
import TaskList from '../components/TaskList';
import CreateTaskForm from '../components/CreateTaskForm';
import connectDB from '../lib/db';
import Task from '../models/Task';

export default async function Home() {
  await connectDB();
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-screen bg-[url('./background.jpg')] bg-fixed py-12">
      <div className="max-w-3xl mx-auto px-4  py-6 rounded-lg ">
        <div className="mb-12 text-center bg-white rounded-lg py-4">
          <h1 className="text-4xl font-bold text-black mb-2">
            Task Manager
          </h1>
          <p className="text-gray-600">Organize your work efficiently</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <CreateTaskForm />
        </div>

        <div className="space-y-5 max-h-auto">
          <h2 className="text-2xl font-semibold text-white text-centre mb-4">Your Tasks</h2>
          <TaskList initialTasks={JSON.parse(JSON.stringify(tasks))} />
        </div>
      </div>
    </main>
  );
}