'use client';
export default function StatsCard({ tasks }) {
  const completed = tasks.filter(t => t.isCompleted).length;
  const progress = (completed / tasks.length) * 100 || 0;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Progress Overview</h2>
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-white/20"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-white"
              strokeWidth="8"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray={`${progress * 2.51} 251`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Completed: {completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Total Tasks: {tasks.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}