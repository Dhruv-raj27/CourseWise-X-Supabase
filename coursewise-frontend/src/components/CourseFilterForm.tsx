import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface CourseFilterFormProps {
  onSubmit: (filters: {
    institution: string;
    branch: string;
    semester: number;
  }) => void;
  currentFilters: {
    institution: string;
    branch: string;
    semester: number;
  };
  onInstitutionChange: () => void;
}

export default function CourseFilterForm({
  onSubmit,
  currentFilters,
  onInstitutionChange,
}: CourseFilterFormProps) {
  const [formData, setFormData] = useState(currentFilters);

  const institutions = {
    active: ['Indraprastha Institute of Information Technology Delhi'],
    comingSoon: [
      // IITs
      'Indian Institute of Technology Delhi',
      'Indian Institute of Technology Bombay',
      'Indian Institute of Technology Madras',
      'Indian Institute of Technology Kanpur',
      'Indian Institute of Technology Kharagpur',
      'Indian Institute of Technology Roorkee',
      'Indian Institute of Technology Guwahati',
      // NITs
      'National Institute of Technology Trichy',
      'National Institute of Technology Surathkal',
      'National Institute of Technology Warangal',
      'National Institute of Technology Calicut',
      'National Institute of Technology Rourkela',
      'National Institute of Technology Delhi'
    ]
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInstitutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInstitution = e.target.value;
    setFormData(prev => ({ ...prev, institution: newInstitution }));
    onInstitutionChange();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institution
          </label>
          <select
            value={formData.institution}
            onChange={handleInstitutionChange}
            className="w-full p-2 border rounded-md"
            required
            aria-label="Select institution"
          >
            <option value="">Select Institution</option>
            <optgroup label="Available">
              {institutions.active.map(inst => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </optgroup>
            <optgroup label="Coming Soon">
              {institutions.comingSoon.map(inst => (
                <option key={inst} value={inst} disabled className="text-gray-400">
                  {inst} (Coming Soon)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {formData.institution && !institutions.active.includes(formData.institution) && (
          <div className="animate-pulse bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                This institution is coming soon! We're working on adding their course data.
              </p>
            </div>
          </div>
        )}

        {/* Rest of the form fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch
          </label>
          <select
            value={formData.branch}
            onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
            className="w-full p-2 border rounded-md"
            required
            aria-label="Select branch"
          >
            <option value="">Select Branch</option>
            <option value="All">All Courses</option>
            <option value="Computer Science and Engineering">Computer Science and Engineering</option>
            <option value="Computer Science and AI">Computer Science and AI</option>
            <option value="Computer Science and Design">Computer Science and Design</option>
            <option value="Computer Science and Social Sciences">Computer Science and Social Sciences</option>
            <option value="Computer Science and Biosciences">Computer Science and Biosciences</option>
            <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <select
            value={formData.semester}
            onChange={(e) => setFormData(prev => ({ ...prev, semester: Number(e.target.value) }))}
            className="w-full p-2 border rounded-md"
            required
            aria-label="Select semester"
          >
            <option value="">Select Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>
                Semester {num}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
} 