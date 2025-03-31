import { supabase } from '../lib/supabase';
import { Course } from '../types/course';

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        prerequisites:course_prerequisites(prerequisite_id),
        schedule:course_schedules(day, start_time, end_time),
        anti_requisites:course_anti_requisites(anti_requisite_id)
      `);

    if (error) throw error;

    return data?.map(course => ({
      ...course,
      prerequisites: course.prerequisites.map((p: any) => p.prerequisite_id),
      antiRequisites: course.anti_requisites.map((a: any) => a.anti_requisite_id),
      schedule: course.schedule.map((s: any) => ({
        day: s.day,
        startTime: s.start_time,
        endTime: s.end_time
      }))
    })) || [];
  },

  getCoursesBySemester: async (semester: number): Promise<Course[]> => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        prerequisites:course_prerequisites(prerequisite_id),
        schedule:course_schedules(day, start_time, end_time),
        anti_requisites:course_anti_requisites(anti_requisite_id)
      `)
      .eq('semester', semester);

    if (error) throw error;

    return data?.map(course => ({
      ...course,
      prerequisites: course.prerequisites.map((p: any) => p.prerequisite_id),
      antiRequisites: course.anti_requisites.map((a: any) => a.anti_requisite_id),
      schedule: course.schedule.map((s: any) => ({
        day: s.day,
        startTime: s.start_time,
        endTime: s.end_time
      }))
    })) || [];
  },

  getUserSelectedCourses: async (userId: string): Promise<Course[]> => {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          *,
          prerequisites:course_prerequisites(prerequisite_id),
          schedule:course_schedules(day, start_time, end_time),
          anti_requisites:course_anti_requisites(anti_requisite_id)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    return enrollments?.map(enrollment => ({
      ...enrollment.course,
      prerequisites: enrollment.course.prerequisites.map((p: any) => p.prerequisite_id),
      antiRequisites: enrollment.course.anti_requisites.map((a: any) => a.anti_requisite_id),
      schedule: enrollment.course.schedule.map((s: any) => ({
        day: s.day,
        startTime: s.start_time,
        endTime: s.end_time
      }))
    })) || [];
  },

  selectCourse: async (userId: string, courseId: string, semester: number): Promise<void> => {
    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        semester: semester,
        status: 'active',
        enrolled_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  unselectCourse: async (userId: string, courseId: string): Promise<void> => {
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .match({ user_id: userId, course_id: courseId });

    if (error) throw error;
  },

  checkTimeClash: (schedule1: Course['schedule'], schedule2: Course['schedule']): boolean => {
    for (const slot1 of schedule1) {
      for (const slot2 of schedule2) {
        if (slot1.day === slot2.day) {
          const start1 = new Date(`1970-01-01T${slot1.startTime}`);
          const end1 = new Date(`1970-01-01T${slot1.endTime}`);
          const start2 = new Date(`1970-01-01T${slot2.startTime}`);
          const end2 = new Date(`1970-01-01T${slot2.endTime}`);

          if (
            (start1 >= start2 && start1 < end2) ||
            (end1 > start2 && end1 <= end2) ||
            (start2 >= start1 && start2 < end1) ||
            (end2 > start1 && end2 <= end1)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
}; 