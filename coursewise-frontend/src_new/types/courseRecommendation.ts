// Basic types for the Course Recommendation feature placeholder
// Will be expanded when the full feature is implemented

// Basic course information type
export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: number;
}

// Basic stream/major information
export interface Stream {
  id: string;
  name: string;
} 