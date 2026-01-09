package com.courseplanner.service;

import com.courseplanner.model.Course;
import com.courseplanner.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserService userService;

    /**
     * Create a new course
     */
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    /**
     * Get all courses
     */
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /**
     * Get all courses for a user
     */
    public List<Course> getUserCourses(String userId) {
        return courseRepository.findByUserId(userId);
    }

    /**
     * Get active courses for a user
     */
    public List<Course> getActiveCourses(String userId) {
        return courseRepository.findByUserIdAndIsActive(userId, true);
    }

    /**
     * Get completed courses for a user
     */
    public List<Course> getCompletedCourses(String userId) {
        return courseRepository.findByUserIdAndIsCompleted(userId, true);
    }

    /**
     * Get course by ID
     */
    public Course getCourseById(String courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    /**
     * Update course
     */
    public Course updateCourse(String courseId, Course updatedCourse) {
        Course existingCourse = getCourseById(courseId);

        // Update allowed fields
        if (updatedCourse.getTitle() != null) {
            existingCourse.setTitle(updatedCourse.getTitle());
        }
        if (updatedCourse.getDescription() != null) {
            existingCourse.setDescription(updatedCourse.getDescription());
        }
        if (updatedCourse.getTags() != null) {
            existingCourse.setTags(updatedCourse.getTags());
        }
        if (updatedCourse.getCategory() != null) {
            existingCourse.setCategory(updatedCourse.getCategory());
        }
        if (updatedCourse.getDifficulty() != null) {
            existingCourse.setDifficulty(updatedCourse.getDifficulty());
        }
        if (updatedCourse.getEstimatedHours() > 0) {
            existingCourse.setEstimatedHours(updatedCourse.getEstimatedHours());
        }

        return courseRepository.save(existingCourse);
    }

    /**
     * Update course progress
     */
    public Course updateProgress(String courseId, int progressPercentage) {
        Course course = getCourseById(courseId);
        int oldProgress = course.getProgressPercentage();
        course.setProgressPercentage(progressPercentage);
        
        // If course is newly completed, update user stats
        if (oldProgress < 100 && progressPercentage >= 100) {
            userService.incrementCompletedCourses(course.getUserId());
            userService.updateUserScore(course.getUserId(), 500); // 500 points for completing a course
        }

        return courseRepository.save(course);
    }

    /**
     * Delete course
     */
    public void deleteCourse(String courseId) {
        Course course = getCourseById(courseId);
        courseRepository.delete(course);
    }

    /**
     * Search courses by title or description
     */
    public List<Course> searchCourses(String searchTerm) {
        return courseRepository.searchByTitleOrDescription(searchTerm);
    }

    /**
     * Get courses by category
     */
    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    /**
     * Get courses by difficulty
     */
    public List<Course> getCoursesByDifficulty(String difficulty) {
        return courseRepository.findByDifficulty(difficulty);
    }

    /**
     * Get courses by tags
     */
    public List<Course> getCoursesByTags(List<String> tags) {
        return courseRepository.findByTagsIn(tags);
    }

    /**
     * Get courses by progress range
     */
    public List<Course> getCoursesByProgressRange(int minProgress, int maxProgress) {
        return courseRepository.findByProgressRange(minProgress, maxProgress);
    }

    /**
     * Get user's courses by category
     */
    public List<Course> getUserCoursesByCategory(String userId, String category) {
        return courseRepository.findByUserIdAndCategory(userId, category);
    }

    /**
     * Count completed courses for user
     */
    public long countCompletedCourses(String userId) {
        return courseRepository.countByUserIdAndIsCompleted(userId, true);
    }
    
    /**
     * Mark course as complete
     */
    public Course markCourseComplete(String courseId) {
        Course course = getCourseById(courseId);
        course.setCompleted(true);
        course.setProgressPercentage(100);
        return courseRepository.save(course);
    }
    
    /**
     * Delete all courses from user_courses collection
     * ⚠️ WARNING: This removes ALL courses for ALL users!
     */
    public long deleteAllCourses() {
        long count = courseRepository.count();
        courseRepository.deleteAll();
        System.out.println("🗑️ Deleted " + count + " courses from user_courses collection");
        return count;
    }
}