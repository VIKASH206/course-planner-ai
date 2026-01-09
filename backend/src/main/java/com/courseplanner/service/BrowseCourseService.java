package com.courseplanner.service;

import com.courseplanner.model.BrowseCourse;
import com.courseplanner.model.CourseRating;
import com.courseplanner.model.UserCourseEnrollment;
import com.courseplanner.repository.BrowseCourseRepository;
import com.courseplanner.repository.CourseRatingRepository;
import com.courseplanner.repository.UserCourseEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BrowseCourseService {

    @Autowired
    private BrowseCourseRepository browseCourseRepository;

    @Autowired
    private UserCourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRatingRepository ratingRepository;

    /**
     * Get paginated courses with filters
     */
    public Page<BrowseCourse> getCourses(
            int page, 
            int size, 
            String search, 
            String category, 
            String level,
            String difficulty,
            Integer minDuration,
            Integer maxDuration,
            String sortBy) {
        
        // Create pageable with sorting
        Sort sort = createSort(sortBy);
        Pageable pageable = PageRequest.of(page - 1, size, sort); // Frontend uses 1-based indexing
        
        Page<BrowseCourse> courses;
        
        // Apply filters based on parameters
        if (search != null && !search.trim().isEmpty()) {
            courses = browseCourseRepository.searchCourses(search.trim(), pageable);
        } else if (category != null && !category.isEmpty() && (difficulty != null && !difficulty.isEmpty())) {
            courses = browseCourseRepository.findByCategoryAndDifficultyAndIsPublished(
                category, difficulty, true, pageable);
        } else if (category != null && !category.isEmpty()) {
            courses = browseCourseRepository.findByCategoryAndIsPublished(category, true, pageable);
        } else if (difficulty != null && !difficulty.isEmpty()) {
            courses = browseCourseRepository.findByDifficultyAndIsPublished(difficulty, true, pageable);
        } else if (level != null && !level.isEmpty()) {
            courses = browseCourseRepository.findByDifficultyAndIsPublished(level, true, pageable);
        } else {
            courses = browseCourseRepository.findByIsPublished(true, pageable);
        }
        
        // Apply duration filter if specified
        if (minDuration != null || maxDuration != null) {
            int min = minDuration != null ? minDuration : 0;
            int max = maxDuration != null ? maxDuration : Integer.MAX_VALUE;
            courses = browseCourseRepository.findByDurationRange(min, max, pageable);
        }
        
        return courses;
    }

    /**
     * Get all courses (for frontend compatibility)
     */
    public List<BrowseCourse> getAllCourses() {
        return browseCourseRepository.findByIsPublished(true, Pageable.unpaged()).getContent();
    }

    /**
     * Get all courses including unpublished (for admin use)
     */
    public List<BrowseCourse> getAllCoursesIncludingUnpublished() {
        return browseCourseRepository.findAll();
    }

    /**
     * Get popular courses (top 10 by popularity score)
     */
    public List<BrowseCourse> getPopularCourses(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "popularityScore", "studentsCount"));
        return browseCourseRepository.findTopPopularCourses(pageable);
    }

    /**
     * Get new courses (recently created)
     */
    public List<BrowseCourse> getNewCourses(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return browseCourseRepository.findByIsPublishedOrderByCreatedAtDesc(true, pageable);
    }

    /**
     * Get trending courses
     */
    public List<BrowseCourse> getTrendingCourses() {
        return browseCourseRepository.findByIsTrendingAndIsPublished(true, true);
    }

    /**
     * Get featured courses
     */
    public List<BrowseCourse> getFeaturedCourses() {
        return browseCourseRepository.findByIsFeaturedAndIsPublished(true, true);
    }

    /**
     * Get course by ID
     */
    public BrowseCourse getCourseById(String courseId) {
        return browseCourseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
    }

    /**
     * Create a new course (for admin/instructor)
     */
    public BrowseCourse createCourse(BrowseCourse course) {
        course.calculatePopularityScore();
        return browseCourseRepository.save(course);
    }

    /**
     * Update course
     */
    public BrowseCourse updateCourse(String courseId, BrowseCourse updatedCourse) {
        BrowseCourse existingCourse = getCourseById(courseId);
        
        if (updatedCourse.getTitle() != null) {
            existingCourse.setTitle(updatedCourse.getTitle());
        }
        if (updatedCourse.getDescription() != null) {
            existingCourse.setDescription(updatedCourse.getDescription());
        }
        if (updatedCourse.getCategory() != null) {
            existingCourse.setCategory(updatedCourse.getCategory());
        }
        if (updatedCourse.getDifficulty() != null) {
            existingCourse.setDifficulty(updatedCourse.getDifficulty());
        }
        if (updatedCourse.getInstructor() != null) {
            existingCourse.setInstructor(updatedCourse.getInstructor());
        }
        if (updatedCourse.getDuration() > 0) {
            existingCourse.setDuration(updatedCourse.getDuration());
        }
        if (updatedCourse.getImageUrl() != null) {
            existingCourse.setImageUrl(updatedCourse.getImageUrl());
        }
        if (updatedCourse.getTags() != null) {
            existingCourse.setTags(updatedCourse.getTags());
        }
        
        existingCourse.setUpdatedAt(LocalDateTime.now());
        existingCourse.calculatePopularityScore();
        
        return browseCourseRepository.save(existingCourse);
    }

    /**
     * Delete course
     */
    public void deleteCourse(String courseId) {
        browseCourseRepository.deleteById(courseId);
    }

    /**
     * Enroll user in a course
     */
    public UserCourseEnrollment enrollUserInCourse(String userId, String courseId) {
        // Check if already enrolled
        Optional<UserCourseEnrollment> existingEnrollment = 
            enrollmentRepository.findByUserIdAndCourseId(userId, courseId);
        
        if (existingEnrollment.isPresent()) {
            throw new RuntimeException("User is already enrolled in this course");
        }
        
        // Verify course exists
        BrowseCourse course = getCourseById(courseId);
        
        // Create enrollment
        UserCourseEnrollment enrollment = new UserCourseEnrollment(userId, courseId);
        enrollment = enrollmentRepository.save(enrollment);
        
        // Update course student count
        course.incrementStudentCount();
        browseCourseRepository.save(course);
        
        return enrollment;
    }

    /**
     * Check if user is enrolled in a course
     */
    public boolean isUserEnrolled(String userId, String courseId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    /**
     * Get user's enrolled courses
     */
    public List<BrowseCourse> getUserEnrolledCourses(String userId) {
        List<UserCourseEnrollment> enrollments = enrollmentRepository.findByUserId(userId);
        List<String> courseIds = enrollments.stream()
                .map(UserCourseEnrollment::getCourseId)
                .collect(Collectors.toList());
        
        return browseCourseRepository.findAllById(courseIds);
    }

    /**
     * Rate a course
     */
    public CourseRating rateCourse(String userId, String courseId, double rating, String review) {
        // Check if user is enrolled
        if (!isUserEnrolled(userId, courseId)) {
            throw new RuntimeException("User must be enrolled to rate the course");
        }
        
        // Check for existing rating
        Optional<CourseRating> existingRating = ratingRepository.findByUserIdAndCourseId(userId, courseId);
        
        CourseRating courseRating;
        if (existingRating.isPresent()) {
            courseRating = existingRating.get();
            courseRating.setRating(rating);
            courseRating.setReview(review);
        } else {
            courseRating = new CourseRating(courseId, userId, rating);
            courseRating.setReview(review);
        }
        
        courseRating = ratingRepository.save(courseRating);
        
        // Update course average rating
        updateCourseAverageRating(courseId);
        
        return courseRating;
    }

    /**
     * Update course average rating
     */
    private void updateCourseAverageRating(String courseId) {
        List<CourseRating> ratings = ratingRepository.findByCourseId(courseId);
        
        if (!ratings.isEmpty()) {
            double averageRating = ratings.stream()
                    .mapToDouble(CourseRating::getRating)
                    .average()
                    .orElse(0.0);
            
            BrowseCourse course = getCourseById(courseId);
            course.setRating(averageRating);
            course.calculatePopularityScore();
            browseCourseRepository.save(course);
        }
    }

    /**
     * Get course statistics
     */
    public Map<String, Object> getCourseStatistics(String courseId) {
        BrowseCourse course = getCourseById(courseId);
        long enrollmentCount = enrollmentRepository.countByCourseId(courseId);
        long ratingCount = ratingRepository.countByCourseId(courseId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("courseId", courseId);
        stats.put("title", course.getTitle());
        stats.put("enrollments", enrollmentCount);
        stats.put("rating", course.getRating());
        stats.put("ratingCount", ratingCount);
        stats.put("popularityScore", course.getPopularityScore());
        stats.put("createdAt", course.getCreatedAt());
        
        return stats;
    }

    /**
     * Create sort based on sortBy parameter
     */
    private Sort createSort(String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "popularityScore");
        }
        
        return switch (sortBy.toLowerCase()) {
            case "popularity" -> Sort.by(Sort.Direction.DESC, "popularityScore", "studentsCount");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "title" -> Sort.by(Sort.Direction.ASC, "title");
            case "duration" -> Sort.by(Sort.Direction.ASC, "duration");
            default -> Sort.by(Sort.Direction.DESC, "popularityScore");
        };
    }

    /**
     * Search courses with advanced filters
     */
    public List<BrowseCourse> searchCourses(String searchTerm) {
        Pageable pageable = PageRequest.of(0, 100); // Get top 100 results
        Page<BrowseCourse> results = browseCourseRepository.searchCourses(searchTerm, pageable);
        return results.getContent();
    }

    /**
     * Get courses by tags
     */
    public List<BrowseCourse> getCoursesByTags(List<String> tags, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<BrowseCourse> results = browseCourseRepository.findByTagsIn(tags, pageable);
        return results.getContent();
    }
}
