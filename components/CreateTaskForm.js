'use client';
import { createTask } from '@/actions/task';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function CreateTaskForm() {
    const router = useRouter();
    const [state, formAction] = useActionState(createTask, null);
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];


    useEffect(() => {
        if (state?.success) {
          router.refresh();
          document.querySelector('form').reset(); // Clear form
        }
      }, [state, router]);
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-black">Create New Task</h2>
      <form action={formAction} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Title"
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <div>
          <textarea
            name="description"
            placeholder="Description"
            className="w-full p-2 border rounded text-black"
          />
        </div>
        <div>
          <input
            type="date"
            name="dueDate"
            min={minDate}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Task
        </button>
        {state?.error && <p className="text-red-500">{state.error}</p>}
      </form>
    </div>
  );
}