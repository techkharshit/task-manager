// app/api/tasks/route.js
import connectDB from '@/lib/db';
import Task from '@/models/Task';

export async function GET() {
  await connectDB();
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();
  
  // Convert MongoDB documents to plain objects
  const serializedTasks = tasks.map(task => ({
    ...task,
    _id: task._id.toString()  // Convert ObjectId to string
  }));

  return Response.json(serializedTasks);
}