package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.EnrolledCourse;
import com.courseplanner.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;
    
    @Autowired
    private com.courseplanner.service.CourseService courseService;

    /**
     * Enroll user in a course
     */
    @PostMapping("/enroll")
    public ResponseEntity<ApiResponse<EnrolledCourse>> enrollInCourse(@RequestBody Map<String, String> request) {
        try {
            System.out.println("🎯 Enrollment request received: " + request);
            
            String userId = request.get("userId");
            String courseId = request.get("courseId");
            
            System.out.println("👤 User ID: " + userId);
            System.out.println("📚 Course ID: " + courseId);
            
            if (userId == null || courseId == null) {
                System.out.println("❌ Missing required fields!");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId and courseId are required"));
            }
            
            System.out.println("📡 Calling enrollUserInCourse...");
            EnrolledCourse enrollment = enrollmentService.enrollUserInCourse(userId, courseId);
            System.out.println("✅ Enrollment successful: " + enrollment);
            
            return ResponseEntity.ok(ApiResponse.success("Enrolled successfully", enrollment));
        } catch (RuntimeException e) {
            System.out.println("❌ Enrollment error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all enrolled courses for a user with course details
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, Object>>>> getUserEnrollments(@PathVariable String userId) {
        try {
            System.out.println("📚 Getting enrollments for user: " + userId);
            List<EnrolledCourse> enrollments = enrollmentService.getUserEnrolledCourses(userId);
            System.out.println("✅ Found " + enrollments.size() + " enrollments");
            
            // Enrich with course details including thumbnail
            List<java.util.Map<String, Object>> enrichedEnrollments = new java.util.ArrayList<>();
            for (EnrolledCourse enrollment : enrollments) {
                System.out.println("🔍 Processing enrollment: " + enrollment.getCourseTitle() + " (ID: " + enrollment.getCourseId() + ")");
                
                java.util.Map<String, Object> enrichedData = new java.util.HashMap<>();
                
                // Add all enrollment fields
                enrichedData.put("id", enrollment.getId());
                enrichedData.put("userId", enrollment.getUserId());
                enrichedData.put("courseId", enrollment.getCourseId());
                enrichedData.put("courseTitle", enrollment.getCourseTitle());
                enrichedData.put("courseCategory", enrollment.getCourseCategory());
                enrichedData.put("courseDifficulty", enrollment.getCourseDifficulty());
                enrichedData.put("progressPercentage", enrollment.getProgressPercentage());
                enrichedData.put("isCompleted", enrollment.isCompleted());
                enrichedData.put("enrolledAt", enrollment.getEnrolledAt());
                enrichedData.put("completedAt", enrollment.getCompletedAt());
                
                // Try to get course thumbnail
                try {
                    com.courseplanner.model.Course course = courseService.getCourseById(enrollment.getCourseId());
                    System.out.println("   📸 Course found: " + (course != null ? "YES" : "NO"));
                    if (course != null) {
                        System.out.println("   🖼️ Thumbnail: " + course.getThumbnail());
                        enrichedData.put("courseThumbnail", course.getThumbnail());
                    } else {
                        System.out.println("   ❌ Course not found for ID: " + enrollment.getCourseId());
                        enrichedData.put("courseThumbnail", null);
                    }
                } catch (Exception e) {
                    System.out.println("   ⚠️ Error getting thumbnail: " + e.getMessage());
                    enrichedData.put("courseThumbnail", null);
                }
                
                enrichedEnrollments.add(enrichedData);
            }
            
            System.out.println("✅ Returning " + enrichedEnrollments.size() + " enriched enrollments");
            return ResponseEntity.ok(ApiResponse.success("Enrollments retrieved successfully", enrichedEnrollments));
        } catch (Exception e) {
            System.out.println("❌ Error in getUserEnrollments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve enrollments: " + e.getMessage()));
        }
    }

    /**
     * Update course progress
     */
    @PutMapping("/progress")
    public ResponseEntity<ApiResponse<EnrolledCourse>> updateProgress(@RequestBody Map<String, Object> request) {
        try {
            String userId = (String) request.get("userId");
            String courseId = (String) request.get("courseId");
            Integer progress = (Integer) request.get("progress");
            
            if (userId == null || courseId == null || progress == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId, courseId, and progress are required"));
            }
            
            EnrolledCourse enrollment = enrollmentService.updateCourseProgress(userId, courseId, progress);
            return ResponseEntity.ok(ApiResponse.success("Progress updated successfully", enrollment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Check if user is enrolled in a course
     */
    @GetMapping("/check/{userId}/{courseId}")
    public ResponseEntity<ApiResponse<Boolean>> checkEnrollment(
            @PathVariable String userId,
            @PathVariable String courseId) {
        try {
            boolean isEnrolled = enrollmentService.isUserEnrolled(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success(isEnrolled));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to check enrollment: " + e.getMessage()));
        }
    }

    /**
     * Unenroll from a course
     */
    @DeleteMapping("/unenroll")
    public ResponseEntity<ApiResponse<String>> unenrollFromCourse(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String courseId = request.get("courseId");
            
            if (userId == null || courseId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId and courseId are required"));
            }
            
            enrollmentService.unenrollUserFromCourse(userId, courseId);
            return ResponseEntity.ok(ApiResponse.success("Unenrolled successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
