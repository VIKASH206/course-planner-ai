package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Course;
import com.courseplanner.model.EnrolledCourse;
import com.courseplanner.model.UserProgress;
import com.courseplanner.repository.EnrolledCourseRepository;
import com.courseplanner.repository.UserProgressRepository;
import com.courseplanner.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user-courses")  // Changed to avoid conflict with BrowseCourseController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class CourseController {

    @Autowired
    private CourseService courseService;
    
    @Autowired
    private ModuleService moduleService;
    
    @Autowired
    private NoteService noteService;
    
    @Autowired
    private UserProgressRepository userProgressRepository;
    
    @Autowired
    private EnrolledCourseRepository enrolledCourseRepository;

    /**
     * Create a new course
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Course>> createCourse(@RequestBody Course course) {
        try {
            Course createdCourse = courseService.createCourse(course);
            return ResponseEntity.ok(ApiResponse.success("Course created successfully", createdCourse));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all courses with filters
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Integer minHours,
            @RequestParam(required = false) Integer maxHours,
            @RequestParam(required = false) String search) {
        try {
            List<Course> courses = courseService.getAllCourses();
            
            // Apply filters
            if (category != null && !category.isEmpty()) {
                courses = courses.stream()
                    .filter(c -> c.getCategory() != null && c.getCategory().equalsIgnoreCase(category))
                    .toList();
            }
            
            if (difficulty != null && !difficulty.isEmpty()) {
                courses = courses.stream()
                    .filter(c -> c.getDifficulty() != null && c.getDifficulty().equalsIgnoreCase(difficulty))
                    .toList();
            }
            
            if (minHours != null) {
                courses = courses.stream()
                    .filter(c -> c.getEstimatedHours() >= minHours)
                    .toList();
            }
            
            if (maxHours != null) {
                courses = courses.stream()
                    .filter(c -> c.getEstimatedHours() <= maxHours)
                    .toList();
            }
            
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                courses = courses.stream()
                    .filter(c -> (c.getTitle() != null && c.getTitle().toLowerCase().contains(searchLower)) ||
                               (c.getDescription() != null && c.getDescription().toLowerCase().contains(searchLower)))
                    .toList();
            }
            
            return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", courses));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve courses: " + e.getMessage()));
        }
    }

    /**
     * Get all courses for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Course>>> getUserCourses(@PathVariable String userId) {
        List<Course> courses = courseService.getUserCourses(userId);
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", courses));
    }

    /**
     * Get active courses for a user
     */
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<ApiResponse<List<Course>>> getActiveCourses(@PathVariable String userId) {
        List<Course> courses = courseService.getActiveCourses(userId);
        return ResponseEntity.ok(ApiResponse.success("Active courses retrieved successfully", courses));
    }

    /**
     * Get completed courses for a user
     */
    @GetMapping("/user/{userId}/completed")
    public ResponseEntity<ApiResponse<List<Course>>> getCompletedCourses(@PathVariable String userId) {
        List<Course> courses = courseService.getCompletedCourses(userId);
        return ResponseEntity.ok(ApiResponse.success("Completed courses retrieved successfully", courses));
    }

    /**
     * Get course by ID
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Course>> getCourse(@PathVariable String courseId) {
        try {
            Course course = courseService.getCourseById(courseId);
            return ResponseEntity.ok(ApiResponse.success(course));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update course
     */
    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Course>> updateCourse(@PathVariable String courseId, @RequestBody Course updatedCourse) {
        try {
            Course course = courseService.updateCourse(courseId, updatedCourse);
            return ResponseEntity.ok(ApiResponse.success("Course updated successfully", course));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Partial update course (PATCH)
     */
    @PatchMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Course>> partialUpdateCourse(
            @PathVariable String courseId, 
            @RequestBody Map<String, Object> updates) {
        try {
            Course course = courseService.getCourseById(courseId);
            
            // Apply partial updates
            if (updates.containsKey("title")) {
                course.setTitle((String) updates.get("title"));
            }
            if (updates.containsKey("description")) {
                course.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("category")) {
                course.setCategory((String) updates.get("category"));
            }
            if (updates.containsKey("difficulty")) {
                course.setDifficulty((String) updates.get("difficulty"));
            }
            if (updates.containsKey("estimatedHours")) {
                course.setEstimatedHours((Integer) updates.get("estimatedHours"));
            }
            if (updates.containsKey("tags")) {
                @SuppressWarnings("unchecked")
                List<String> tags = (List<String>) updates.get("tags");
                course.setTags(tags);
            }
            if (updates.containsKey("isActive")) {
                course.setActive((Boolean) updates.get("isActive"));
            }
            
            Course updatedCourse = courseService.updateCourse(courseId, course);
            return ResponseEntity.ok(ApiResponse.success("Course updated successfully", updatedCourse));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update course progress
     */
    @PutMapping("/{courseId}/progress")
    public ResponseEntity<ApiResponse<Course>> updateProgress(@PathVariable String courseId, @RequestParam int progress) {
        try {
            Course course = courseService.updateProgress(courseId, progress);
            return ResponseEntity.ok(ApiResponse.success("Progress updated successfully", course));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete course
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<String>> deleteCourse(@PathVariable String courseId) {
        try {
            courseService.deleteCourse(courseId);
            return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", "Course deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Enroll user in a course
     */
    @PostMapping("/enroll")
    public ResponseEntity<ApiResponse<Map<String, Object>>> enrollInCourse(
            @RequestBody Map<String, String> enrollmentData) {
        try {
            String courseId = enrollmentData.get("courseId");
            String userId = enrollmentData.get("userId");
            
            if (courseId == null || userId == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("courseId and userId are required"));
            }
            
            Course course = courseService.getCourseById(courseId);
            
            // In a real implementation, you would:
            // 1. Check if user is authenticated
            // 2. Create an enrollment record in enrollments table
            // 3. Update user's enrolled courses list
            
            Map<String, Object> result = Map.of(
                "courseId", courseId,
                "userId", userId,
                "enrolled", true,
                "enrollmentDate", new java.util.Date(),
                "message", "Successfully enrolled in " + course.getTitle()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Enrollment successful", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Enrollment failed: " + e.getMessage()));
        }
    }
    
    /**
     * Unenroll user from a course
     */
    @DeleteMapping("/enroll")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unenrollFromCourse(
            @RequestBody Map<String, String> enrollmentData) {
        try {
            String courseId = enrollmentData.get("courseId");
            String userId = enrollmentData.get("userId");
            
            if (courseId == null || userId == null) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("courseId and userId are required"));
            }
            
            Course course = courseService.getCourseById(courseId);
            
            // In a real implementation, you would:
            // 1. Check if user is authenticated
            // 2. Delete enrollment record from enrollments table
            // 3. Update user's enrolled courses list
            
            Map<String, Object> result = Map.of(
                "courseId", courseId,
                "userId", userId,
                "enrolled", false,
                "unenrollmentDate", new java.util.Date(),
                "message", "Successfully unenrolled from " + course.getTitle()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Unenrollment successful", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Unenrollment failed: " + e.getMessage()));
        }
    }

    /**
     * Search courses
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Course>>> searchCourses(@RequestParam String query) {
        List<Course> courses = courseService.searchCourses(query);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", courses));
    }

    /**
     * Get courses by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Course>>> getCoursesByCategory(@PathVariable String category) {
        List<Course> courses = courseService.getCoursesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Courses by category retrieved successfully", courses));
    }

    /**
     * Get courses by difficulty
     */
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<ApiResponse<List<Course>>> getCoursesByDifficulty(@PathVariable String difficulty) {
        List<Course> courses = courseService.getCoursesByDifficulty(difficulty);
        return ResponseEntity.ok(ApiResponse.success("Courses by difficulty retrieved successfully", courses));
    }

    /**
     * Get user's courses by category
     */
    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<ApiResponse<List<Course>>> getUserCoursesByCategory(@PathVariable String userId, @PathVariable String category) {
        List<Course> courses = courseService.getUserCoursesByCategory(userId, category);
        return ResponseEntity.ok(ApiResponse.success("User courses by category retrieved successfully", courses));
    }

    /**
     * Get courses by tags
     */
    @PostMapping("/tags")
    public ResponseEntity<ApiResponse<List<Course>>> getCoursesByTags(@RequestBody List<String> tags) {
        List<Course> courses = courseService.getCoursesByTags(tags);
        return ResponseEntity.ok(ApiResponse.success("Courses by tags retrieved successfully", courses));
    }
    
    // ============= ENHANCED COURSE PAGE APIS =============
    
    /**
     * Get detailed course view with modules, current progress, and recommendations
     */
    @GetMapping("/{courseId}/details/{userId}")
    public ResponseEntity<ApiResponse<?>> getCourseDetails(@PathVariable String courseId, @PathVariable String userId) {
        try {
            // Check if user is enrolled in the course
            EnrolledCourse enrolledCourse = enrolledCourseRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElse(null);
            
            // If not enrolled, return basic course info with enrollment prompt
            if (enrolledCourse == null) {
                Course course = courseService.getCourseById(courseId);
                if (course == null) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Course not found"));
                }
                
                Map<String, Object> basicInfo = Map.of(
                    "enrolled", false,
                    "course", Map.of(
                        "id", course.getId(),
                        "title", course.getTitle(),
                        "description", course.getDescription() != null ? course.getDescription() : "",
                        "category", course.getCategory() != null ? course.getCategory() : "General",
                        "difficulty", course.getDifficulty() != null ? course.getDifficulty() : "Beginner",
                        "thumbnail", course.getThumbnail() != null ? course.getThumbnail() : ""
                    ),
                    "message", "You are not enrolled in this course. Please enroll to access full content."
                );
                return ResponseEntity.ok(ApiResponse.success("Course info retrieved", basicInfo));
            }
            
            // Get modules with progress
            List<ModuleService.ModuleWithProgress> modules = moduleService.getModulesWithProgress(courseId, userId);
            
            // Get overall course progress
            UserProgress courseProgress = userProgressRepository
                .findByUserIdAndCourseIdAndModuleIdIsNull(userId, courseId)
                .orElse(new UserProgress(userId, courseId));
            
            // Calculate overall progress from modules
            if (!modules.isEmpty()) {
                int totalProgress = modules.stream()
                    .mapToInt(ModuleService.ModuleWithProgress::getProgress)
                    .sum();
                int overallProgress = totalProgress / modules.size();
                courseProgress.setProgressPercentage(overallProgress);
            }
            
            // Get notes count
            long notesCount = noteService.getNoteCount(userId, courseId);
            
            // Get next module to study
            com.courseplanner.model.Module nextModule = moduleService.getNextModule(courseId, userId);
            
            // AI Recommendations (placeholder - can be enhanced with actual AI)
            List<String> recommendations = List.of(
                "Continue with Module: " + (nextModule != null ? nextModule.getTitle() : "All completed!"),
                "You're making great progress! Keep it up!",
                "Review your notes to reinforce learning",
                "Try the practice quiz to test your knowledge"
            );
            
            // Build course object from enrolled course
            Map<String, Object> courseInfo = Map.of(
                "id", enrolledCourse.getCourseId(),
                "title", enrolledCourse.getCourseTitle(),
                "category", enrolledCourse.getCourseCategory() != null ? enrolledCourse.getCourseCategory() : "General",
                "difficulty", enrolledCourse.getCourseDifficulty() != null ? enrolledCourse.getCourseDifficulty() : "Beginner",
                "thumbnail", enrolledCourse.getCourseThumbnail() != null ? enrolledCourse.getCourseThumbnail() : ""
            );
            
            // Build comprehensive response
            Map<String, Object> courseDetails = Map.of(
                "course", courseInfo,
                "modules", modules,
                "overallProgress", courseProgress.getProgressPercentage(),
                "completedModules", modules.stream().filter(ModuleService.ModuleWithProgress::isCompleted).count(),
                "totalModules", modules.size(),
                "notesCount", notesCount,
                "nextModule", nextModule != null ? nextModule : Map.of("message", "All modules completed!"),
                "recommendations", recommendations,
                "timeSpentMinutes", courseProgress.getTimeSpentMinutes()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Course details retrieved successfully", courseDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course not found: " + e.getMessage()));
        }
    }
    
    /**
     * Start or continue a course - returns current module/topic to study
     */
    @PostMapping("/{courseId}/start/{userId}")
    public ResponseEntity<ApiResponse<?>> startOrContinueCourse(@PathVariable String courseId, @PathVariable String userId) {
        try {
            // Check if user is enrolled
            EnrolledCourse enrolledCourse = enrolledCourseRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("You are not enrolled in this course"));
            
            // Get next module to study
            com.courseplanner.model.Module nextModule = moduleService.getNextModule(courseId, userId);
            
            if (nextModule == null) {
                return ResponseEntity.ok(ApiResponse.success("All modules completed!", Map.of(
                    "courseId", enrolledCourse.getCourseId(),
                    "courseTitle", enrolledCourse.getCourseTitle(),
                    "completed", true,
                    "message", "Congratulations! You've completed all modules in this course."
                )));
            }
            
            // Update last accessed time
            UserProgress progress = userProgressRepository
                .findByUserIdAndCourseIdAndModuleIdIsNull(userId, courseId)
                .orElse(new UserProgress(userId, courseId));
            progress.setLastAccessedAt(java.time.LocalDateTime.now());
            userProgressRepository.save(progress);
            
            Map<String, Object> startInfo = Map.of(
                "courseId", enrolledCourse.getCourseId(),
                "courseTitle", enrolledCourse.getCourseTitle(),
                "nextModule", nextModule,
                "action", "continue",
                "message", "Continue learning with: " + nextModule.getTitle()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Ready to continue learning", startInfo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Mark course as complete
     */
    @PutMapping("/{courseId}/complete/{userId}")
    public ResponseEntity<ApiResponse<Course>> completeCourse(@PathVariable String courseId, @PathVariable String userId) {
        try {
            Course course = courseService.markCourseComplete(courseId);
            return ResponseEntity.ok(ApiResponse.success("Course marked as complete", course));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Get course progress summary
     */
    @GetMapping("/{courseId}/progress/{userId}")
    public ResponseEntity<ApiResponse<?>> getCourseProgress(@PathVariable String courseId, @PathVariable String userId) {
        try {
            Course course = courseService.getCourseById(courseId);
            
            // Get modules with progress
            List<ModuleService.ModuleWithProgress> modules = moduleService.getModulesWithProgress(courseId, userId);
            
            // Calculate detailed progress metrics
            long totalModules = modules.size();
            long completedModules = modules.stream().filter(ModuleService.ModuleWithProgress::isCompleted).count();
            int totalTimeSpent = modules.stream().mapToInt(ModuleService.ModuleWithProgress::getTimeSpentMinutes).sum();
            
            // Get overall course progress
            UserProgress courseProgress = userProgressRepository
                .findByUserIdAndCourseIdAndModuleIdIsNull(userId, courseId)
                .orElse(new UserProgress(userId, courseId));
            
            // Calculate overall progress percentage
            int overallProgress = totalModules > 0 ? (int)((completedModules * 100) / totalModules) : 0;
            
            Map<String, Object> progressInfo = Map.of(
                "courseId", courseId,
                "userId", userId,
                "overallProgress", overallProgress,
                "progressPercentage", course.getProgressPercentage(),
                "completedModules", completedModules,
                "totalModules", totalModules,
                "remainingModules", totalModules - completedModules,
                "timeSpentMinutes", totalTimeSpent,
                "isCompleted", course.isCompleted(),
                "lastAccessedAt", courseProgress.getLastAccessedAt()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Course progress retrieved", progressInfo));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course not found: " + e.getMessage()));
        }
    }
    
    /**
     * 🗑️ Delete all courses from user_courses collection (cleanup utility)
     * WARNING: This will remove ALL courses for ALL users!
     */
    @DeleteMapping("/cleanup-all")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupAllUserCourses() {
        try {
            long deletedCount = courseService.deleteAllCourses();
            
            Map<String, Object> result = Map.of(
                "success", true,
                "deletedCount", deletedCount,
                "message", "All courses deleted from user_courses collection"
            );
            
            return ResponseEntity.ok(ApiResponse.success("Cleanup completed", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Cleanup failed: " + e.getMessage()));
        }
    }
    
    // Removed unused test endpoint - Module and Topic models have been removed
    // /**
    //  * Test endpoint to create sample data
    //  */
    // @PostMapping("/test/create-sample-data")
    // public ResponseEntity<ApiResponse<?>> createSampleData() {
    //     // This endpoint has been removed as Module and Topic collections are no longer in use
    // }
}