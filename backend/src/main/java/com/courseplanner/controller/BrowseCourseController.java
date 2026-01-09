package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.BrowseCourse;
import com.courseplanner.model.CourseRating;
import com.courseplanner.model.UserCourseEnrollment;
import com.courseplanner.service.BrowseCourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class BrowseCourseController {

    @Autowired
    private BrowseCourseService browseCourseService;

    /**
     * GET /api/courses - Get paginated courses with filters
     * Supports: pagination, search, category filter, difficulty/level filter
     * 
     * Examples:
     * - /api/courses?page=1&size=10
     * - /api/courses?search=python
     * - /api/courses?category=AI&level=Beginner
     * - /api/courses?page=1&size=20&sortBy=rating
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCourses(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) String sortBy) {
        
        try {
            Page<BrowseCourse> coursesPage = browseCourseService.getCourses(
                page, size, search, category, level, difficulty, minDuration, maxDuration, sortBy);
            
            Map<String, Object> response = new HashMap<>();
            response.put("courses", coursesPage.getContent());
            response.put("currentPage", coursesPage.getNumber() + 1); // Frontend uses 1-based
            response.put("totalPages", coursesPage.getTotalPages());
            response.put("totalItems", coursesPage.getTotalElements());
            response.put("pageSize", coursesPage.getSize());
            response.put("hasNext", coursesPage.hasNext());
            response.put("hasPrevious", coursesPage.hasPrevious());
            
            return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/all - Get all courses (for frontend compatibility)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<BrowseCourse>>> getAllCourses(
            @RequestParam(required = false, defaultValue = "false") boolean includeUnpublished) {
        try {
            List<BrowseCourse> courses;
            if (includeUnpublished) {
                courses = browseCourseService.getAllCoursesIncludingUnpublished();
            } else {
                courses = browseCourseService.getAllCourses();
            }
            return ResponseEntity.ok(ApiResponse.success("All courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/popular - Get popular courses
     */
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<BrowseCourse>>> getPopularCourses(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<BrowseCourse> courses = browseCourseService.getPopularCourses(limit);
            return ResponseEntity.ok(ApiResponse.success("Popular courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve popular courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/new - Get new courses
     */
    @GetMapping("/new")
    public ResponseEntity<ApiResponse<List<BrowseCourse>>> getNewCourses(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<BrowseCourse> courses = browseCourseService.getNewCourses(limit);
            return ResponseEntity.ok(ApiResponse.success("New courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve new courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/trending - Get trending courses
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<BrowseCourse>>> getTrendingCourses() {
        try {
            List<BrowseCourse> courses = browseCourseService.getTrendingCourses();
            return ResponseEntity.ok(ApiResponse.success("Trending courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve trending courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/featured - Get featured courses
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<BrowseCourse>>> getFeaturedCourses() {
        try {
            List<BrowseCourse> courses = browseCourseService.getFeaturedCourses();
            return ResponseEntity.ok(ApiResponse.success("Featured courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve featured courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/{courseId} - Get course by ID
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<BrowseCourse>> getCourse(@PathVariable String courseId) {
        try {
            BrowseCourse course = browseCourseService.getCourseById(courseId);
            return ResponseEntity.ok(ApiResponse.success("Course retrieved successfully", course));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course not found: " + e.getMessage()));
        }
    }

    /**
     * POST /api/courses - Create a new course (Admin/Instructor)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BrowseCourse>> createCourse(@RequestBody BrowseCourse course) {
        try {
            BrowseCourse createdCourse = browseCourseService.createCourse(course);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Course created successfully", createdCourse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create course: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/courses/{courseId} - Update course
     */
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<BrowseCourse>> updateCourse(
            @PathVariable String courseId,
            @RequestBody BrowseCourse course) {
        try {
            BrowseCourse updatedCourse = browseCourseService.updateCourse(courseId, course);
            return ResponseEntity.ok(ApiResponse.success("Course updated successfully", updatedCourse));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course not found: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/courses/{courseId} - Delete course
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable String courseId) {
        try {
            browseCourseService.deleteCourse(courseId);
            return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete course: " + e.getMessage()));
        }
    }

    /**
     * POST /api/courses/enroll - Enroll user in a course
     * Request body: { "userId": "...", "courseId": "..." }
     */
    @PostMapping("/enroll")
    public ResponseEntity<ApiResponse<UserCourseEnrollment>> enrollInCourse(
            @RequestBody Map<String, String> enrollmentRequest) {
        try {
            String userId = enrollmentRequest.get("userId");
            String courseId = enrollmentRequest.get("courseId");
            
            if (userId == null || courseId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId and courseId are required"));
            }
            
            UserCourseEnrollment enrollment = browseCourseService.enrollUserInCourse(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success("Successfully enrolled in course", enrollment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/courses/{courseId}/enroll/{userId} - Alternative enrollment endpoint
     */
    @PostMapping("/{courseId}/enroll/{userId}")
    public ResponseEntity<ApiResponse<UserCourseEnrollment>> enrollUserInCourse(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            UserCourseEnrollment enrollment = browseCourseService.enrollUserInCourse(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success("Successfully enrolled in course", enrollment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/courses/user/{userId}/enrolled - Get user's enrolled courses
     */
    @GetMapping("/user/{userId}/enrolled")
    public ResponseEntity<ApiResponse<List<BrowseCourse>>> getUserEnrolledCourses(
            @PathVariable String userId) {
        try {
            List<BrowseCourse> courses = browseCourseService.getUserEnrolledCourses(userId);
            return ResponseEntity.ok(ApiResponse.success("User enrolled courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve enrolled courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/{courseId}/enrollment-status/{userId} - Check enrollment status
     */
    @GetMapping("/{courseId}/enrollment-status/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEnrollmentStatus(
            @PathVariable String courseId,
            @PathVariable String userId) {
        try {
            boolean isEnrolled = browseCourseService.isUserEnrolled(userId, courseId);
            Map<String, Boolean> status = new HashMap<>();
            status.put("isEnrolled", isEnrolled);
            return ResponseEntity.ok(ApiResponse.success("Enrollment status retrieved", status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check enrollment status: " + e.getMessage()));
        }
    }

    /**
     * POST /api/courses/{courseId}/rate - Rate a course
     * Request body: { "userId": "...", "rating": 4.5, "review": "..." }
     */
    @PostMapping("/{courseId}/rate")
    public ResponseEntity<ApiResponse<CourseRating>> rateCourse(
            @PathVariable String courseId,
            @RequestBody Map<String, Object> ratingRequest) {
        try {
            String userId = (String) ratingRequest.get("userId");
            Double rating = ((Number) ratingRequest.get("rating")).doubleValue();
            String review = (String) ratingRequest.getOrDefault("review", "");
            
            if (userId == null || rating == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId and rating are required"));
            }
            
            CourseRating courseRating = browseCourseService.rateCourse(userId, courseId, rating, review);
            return ResponseEntity.ok(ApiResponse.success("Course rated successfully", courseRating));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/courses/{courseId}/statistics - Get course statistics
     */
    @GetMapping("/{courseId}/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCourseStatistics(
            @PathVariable String courseId) {
        try {
            Map<String, Object> stats = browseCourseService.getCourseStatistics(courseId);
            return ResponseEntity.ok(ApiResponse.success("Course statistics retrieved successfully", stats));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course not found: " + e.getMessage()));
        }
    }

    /**
     * GET /api/courses/search - Search courses
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<BrowseCourse>>> searchCourses(
            @RequestParam String q) {
        try {
            List<BrowseCourse> courses = browseCourseService.searchCourses(q);
            return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Search failed: " + e.getMessage()));
        }
    }
}
