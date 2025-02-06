// actions/task.js
'use server';
import connectDB from '../lib/db';
import Task from '../models/Task';
import { revalidatePath } from 'next/cache';

const getNormalizedDate = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const createTask = async (prevState, formData) => {
  try {
    await connectDB();
    
    const dueDate = new Date(formData.get('dueDate'));
    const today = getNormalizedDate(new Date());

    if (getNormalizedDate(dueDate) < today) {
      return { error: 'Due date cannot be in the past' };
    }


    const task = new Task({
      title: formData.get('title'),
      description: formData.get('description'),
      dueDate: dueDate
    });
    
    await task.save();
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

const safeDateConvert = (date) => {
  try {
    return date instanceof Date ? date.toISOString() : null;
  } catch {
    return null;
  }
};

export const updateTask = async (id, formData) => {
  try {
    await connectDB();
    
    const updates = {};

    // Handle all possible fields
    const updateFields = ['priority', 'isCompleted', 'title', 'description', 'dueDate'];
    
    updateFields.forEach(field => {
      if (formData.has(field)) {
        updates[field] = field === 'dueDate' 
          ? new Date(formData.get(field))
          : field === 'isCompleted'
          ? formData.get(field) === 'true'
          : formData.get(field);
      }
    });

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTask) {
      throw new Error('Task not found');
    }

    // Safely convert dates to ISO strings
    return {
      ...updatedTask,
      _id: updatedTask._id.toString(),
      dueDate: safeDateConvert(updatedTask.dueDate),
      createdAt: safeDateConvert(updatedTask.createdAt),
      updatedAt: safeDateConvert(updatedTask.updatedAt)
    };
  } catch (error) {
    console.error('Update error:', error);
    return { error: error.message };
  }
};

export const deleteTask = async (id) => {
  try {
    await connectDB();
    await Task.findByIdAndDelete(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};