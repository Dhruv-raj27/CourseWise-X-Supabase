import express, { Request, Response } from 'express';
import Course from '../models/Course';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

interface CourseQuery {
  institution?: string;
  branch?: string;
  semester?: number;
}

// Get all courses
router.get('/', async (req: Request<{}, {}, {}, CourseQuery>, res: Response) => {
  const { institution, branch, semester } = req.query;

  try {
    const courses = await Course.find({
      semester: semester,
      stream: branch === 'All' ? { $exists: true } : branch,
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add route to select a course
router.post('/select', auth, async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.body;
  const userId = (req as any).user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Add logic to check for schedule conflicts
    // Add logic to check prerequisites

    res.json({ message: 'Course selected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add more course-related routes as needed (e.g., create, update, delete)

export default router; 