import express, { Request, Response, Router } from 'express';
import Course from '../models/Course';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router: Router = express.Router();

interface CourseQuery {
  institution?: string;
  branch?: string;
  semester?: number;
}

// ✅ **Get All Courses**
router.get('/', async (req: Request<{}, {}, {}, CourseQuery>, res: Response): Promise<void> => {
  try {
    const { institution, branch, semester } = req.query;

    const query: any = {};
    if (institution) query.institution = institution;
    if (branch && branch !== 'All') query.stream = branch;
    if (semester) query.semester = semester;

    const courses = await Course.find(query);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ **Select a Course**
router.post('/select', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = (req as any).user.id;

    if (!courseId) {
      res.status(400).json({ message: 'Course ID is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // ✅ **Check if the user has already selected this course**
    if (user.selectedCourses?.includes(courseId)) {
      res.status(400).json({ message: 'Course already selected' });
      return;
    }

    // ✅ **Check Schedule Conflicts (Placeholder - Implement Logic)**
    // Example: Check if course timings overlap with existing ones
    // const hasConflict = checkScheduleConflict(user.selectedCourses, course);
    // if (hasConflict) {
    //   res.status(400).json({ message: 'Schedule conflict detected' });
    //   return;
    // }

    // ✅ **Check Prerequisites (Placeholder - Implement Logic)**
    // Example: Ensure user has completed necessary prerequisite courses
    // if (!hasMetPrerequisites(user.completedCourses, course)) {
    //   res.status(400).json({ message: 'Prerequisites not met' });
    //   return;
    // }

    // ✅ **Add Course to User's Selected List**
    user.selectedCourses = [...(user.selectedCourses || []), courseId];
    await user.save();

    res.json({ message: 'Course selected successfully', selectedCourses: user.selectedCourses });
  } catch (error) {
    console.error('Error selecting course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
