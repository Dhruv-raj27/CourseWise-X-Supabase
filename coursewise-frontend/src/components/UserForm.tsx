import React from 'react';
import { UserParams } from '../types/index';

interface UserFormProps {
  params: UserParams;
  onParamsChange: (params: UserParams) => void;
}

export default function UserForm({ params, onParamsChange }: UserFormProps) {
  const streams = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Academic Parameters</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Stream</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={params.stream}
            onChange={(e) => onParamsChange({ ...params, stream: e.target.value })}
            aria-label="Select stream"
          >
            <option value="">Select Stream</option>
            {streams.map((stream) => (
              <option key={stream} value={stream}>
                {stream}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={params.semester}
            onChange={(e) => onParamsChange({ ...params, semester: Number(e.target.value) })}
            aria-label="Select semester"
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CGPA</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={params.cgpa}
            onChange={(e) => onParamsChange({ ...params, cgpa: Number(e.target.value) })}
            aria-label="Enter CGPA"
            placeholder="Enter your CGPA"
          />
        </div>
      </div>
    </div>
  );
}