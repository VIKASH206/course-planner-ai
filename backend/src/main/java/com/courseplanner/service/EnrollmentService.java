package com.courseplanner.service;

import com.courseplanner.model.EnrolledCourse;
import com.courseplanner.model.Course;
import com.courseplanner.model.BrowseCourse;
import com.courseplanner.repository.EnrolledCourseRepository;
import com.courseplanner.repository.CourseRepository;
import com.courseplanner.repository.BrowseCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EnrollmentService {

    @Autowired
    private EnrolledCourseRepository enrolledCourseRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private BrowseCourseRepository browseCourseRepository;

    /**
     * Enroll a user in a course
     */
    public EnrolledCourse enrollUserInCourse(String userId, String courseId) {
        System.out.println("📝 EnrollmentService.enrollUserInCourse called");
        System.out.println("   User ID: " + userId);
        System.out.println("   Course ID: " + courseId);
        
        // Check if already enrolled
        boolean alreadyEnrolled = enrolledCourseRepository.existsByUserIdAndCourseId(userId, courseId);
        System.out.println("   Already enrolled: " + alreadyEnrolled);
        
        if (alreadyEnrolled) {
            throw new RuntimeException("User is already enrolled in this course");
        }
        
        // Try to get course from browse_courses first, then user_courses
        System.out.println("   🔍 Checking browse_courses collection...");
        Optional<BrowseCourse> browseCourseOpt = browseCourseRepository.findById(courseId);
        System.out.println("   Browse course found: " + browseCourseOpt.isPresent());
        
        Optional<Course> courseOpt = Optional.empty();
        if (!browseCourseOpt.isPresent()) {
            System.out.println("   🔍 Checking user_courses collection...");
            courseOpt = courseRepository.findById(courseId);
            System.out.println("   User course found: " + courseOpt.isPresent());
        }
        
        EnrolledCourse enrollment = new EnrolledCourse(userId, courseId, "");
        
        if (browseCourseOpt.isPresent()) {
            BrowseCourse browseCourse = browseCourseOpt.get();
            System.out.println("   📚 Using browse course: " + browseCourse.getTitle());
            enrollment.setCourseTitle(browseCourse.getTitle());
            enrollment.setCourseCategory(browseCourse.getCategory());
            enrollment.setCourseDifficulty(browseCourse.getDifficulty());
            enrollment.setCourseThumbnail(browseCourse.getImageUrl());  // Save image URL
            enrollment.setCourseImageUrl(browseCourse.getImageUrl());   // Alternative field
        } else if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            System.out.println("   📚 Using user course: " + course.getTitle());
            enrollment.setCourseTitle(course.getTitle());
            enrollment.setCourseCategory(course.getCategory());
            enrollment.setCourseDifficulty(course.getDifficulty());
            enrollment.setCourseThumbnail(course.getThumbnail());  // Save thumbnail (Course uses thumbnail, not imageUrl)
            enrollment.setCourseImageUrl(course.getThumbnail());   // Alternative field
        } else {
            System.out.println("   ⚠️ Course not found in any collection! Setting default title.");
            enrollment.setCourseTitle("Unknown Course");
        }
        
        System.out.println("   💾 Saving enrollment to enrolled_courses collection...");
        EnrolledCourse saved = enrolledCourseRepository.save(enrollment);
        System.out.println("   ✅ Enrollment saved with ID: " + saved.getId());
        
        return saved;
    }

    /**
     * Get all enrolled courses for a user
     */
    public List<EnrolledCourse> getUserEnrolledCourses(String userId) {
        return enrolledCourseRepository.findByUserId(userId);
    }
    
    /**
     * Get single enrolled course for a user
     */
    public EnrolledCourse getUserEnrolledCourse(String userId, String courseId) {
        Optional<EnrolledCourse> enrollmentOpt = enrolledCourseRepository.findByUserIdAndCourseId(userId, courseId);
        return enrollmentOpt.orElse(null);
    }

    /**
     * Get enrollment count for a user
     */
    public long getUserEnrollmentCount(String userId) {
        return enrolledCourseRepository.countByUserId(userId);
    }

    /**
     * Update course progress
     */
    public EnrolledCourse updateCourseProgress(String userId, String courseId, int progressPercentage) {
        Optional<EnrolledCourse> enrollmentOpt = enrolledCourseRepository.findByUserIdAndCourseId(userId, courseId);
        
        if (!enrollmentOpt.isPresent()) {
            throw new RuntimeException("Enrollment not found");
        }
        
        EnrolledCourse enrollment = enrollmentOpt.get();
        enrollment.setProgressPercentage(progressPercentage);
        
        // Mark as completed if 100%
        if (progressPercentage >= 100 && !enrollment.isCompleted()) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
        }
        
        return enrolledCourseRepository.save(enrollment);
    }

    /**
     * Check if user is enrolled in a course
     */
    public boolean isUserEnrolled(String userId, String courseId) {
        return enrolledCourseRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    /**
     * Unenroll user from a course
     */
    public void unenrollUserFromCourse(String userId, String courseId) {
        Optional<EnrolledCourse> enrollmentOpt = enrolledCourseRepository.findByUserIdAndCourseId(userId, courseId);
        
        if (enrollmentOpt.isPresent()) {
            enrolledCourseRepository.delete(enrollmentOpt.get());
        } else {
            throw new RuntimeException("Enrollment not found");
        }
    }

    /**
     * Get completed courses count
     */
    public long getCompletedCoursesCount(String userId) {
        return enrolledCourseRepository.countByUserIdAndIsCompleted(userId, true);
    }
}
