package com.courseplanner.admin.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.CourseRequest;
import com.courseplanner.service.CourseRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Admin Coming Soon Courses Controller
 * Manages course requests and coming soon courses for admin panel
 */
@RestController
@RequestMapping("/api/admin/coming-soon")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AdminComingSoonController {

    @Autowired
    private CourseRequestService courseRequestService;

    /**
     * GET /api/admin/coming-soon/stats - Get coming soon statistics
     * Returns total, pending, in progress, and ready counts
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getComingSoonStats() {
        try {
            CourseRequestService.CourseRequestStats stats = courseRequestService.getStatistics();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalRequests", stats.getTotalRequests());
            response.put("pending", stats.getPendingCount());
            response.put("inProgress", stats.getInProgressCount());
            response.put("ready", stats.getReadyCount());
            
            return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/coming-soon - Get all course requests with filters
     * Query params: status, level
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseRequest>>> getAllComingSoonCourses(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String level) {
        try {
            List<CourseRequest> requests;
            
            if (status != null && level != null) {
                requests = courseRequestService.getCourseRequestsByStatusAndLevel(status, level);
            } else if (status != null) {
                requests = courseRequestService.getCourseRequestsByStatus(status);
            } else if (level != null) {
                requests = courseRequestService.getCourseRequestsByLevel(level);
            } else {
                requests = courseRequestService.getAllCourseRequests();
            }
            
            return ResponseEntity.ok(ApiResponse.success("Course requests retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve course requests: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/coming-soon/{id} - Get specific course request
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseRequest>> getCourseRequestById(@PathVariable String id) {
        try {
            CourseRequest request = courseRequestService.getCourseRequestById(id);
            return ResponseEntity.ok(ApiResponse.success("Course request retrieved successfully", request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Course request not found: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/coming-soon/{id}/status - Update course request status
     * Body: { "status": "Pending|In Progress|Ready|Completed" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CourseRequest>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Status is required"));
            }
            
            CourseRequest updated = courseRequestService.updateStatus(id, newStatus);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update status: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/coming-soon/{id}/plan - Mark course as planned (In Progress)
     */
    @PutMapping("/{id}/plan")
    public ResponseEntity<ApiResponse<CourseRequest>> markAsPlanned(@PathVariable String id) {
        try {
            CourseRequest updated = courseRequestService.markAsPlanned(id);
            return ResponseEntity.ok(ApiResponse.success("Course marked as planned", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to mark as planned: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/coming-soon/{id}/ready - Mark course as ready
     */
    @PutMapping("/{id}/ready")
    public ResponseEntity<ApiResponse<CourseRequest>> markAsReady(@PathVariable String id) {
        try {
            CourseRequest updated = courseRequestService.markAsReady(id);
            return ResponseEntity.ok(ApiResponse.success("Course marked as ready", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to mark as ready: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/coming-soon/{id} - Delete course request
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourseRequest(@PathVariable String id) {
        try {
            courseRequestService.deleteCourseRequest(id);
            return ResponseEntity.ok(ApiResponse.success("Course request deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to delete course request: " + e.getMessage()));
        }
    }

    /**
     * POST /api/admin/coming-soon - Create new course request manually
     * Body: { "interest": "Course Topic", "level": "Beginner|Intermediate|Advanced", "requestedBy": 5 }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseRequest>> createCourseRequest(
            @RequestBody Map<String, Object> request) {
        try {
            String interest = (String) request.get("interest");
            String level = (String) request.get("level");
            
            if (interest == null || interest.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Interest is required"));
            }
            if (level == null || level.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Level is required"));
            }
            
            CourseRequest newRequest = new CourseRequest(interest, level);
            
            // Set initial requested count if provided
            if (request.containsKey("requestedBy")) {
                Integer requestedBy = (Integer) request.get("requestedBy");
                if (requestedBy != null && requestedBy > 0) {
                    newRequest.setRequestedBy(requestedBy);
                }
            }
            
            CourseRequest saved = courseRequestService.saveCourseRequest(newRequest);
            return ResponseEntity.ok(ApiResponse.success("Course request created successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create course request: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/coming-soon/most-requested - Get top requested courses
     */
    @GetMapping("/most-requested")
    public ResponseEntity<ApiResponse<List<CourseRequest>>> getMostRequestedCourses() {
        try {
            List<CourseRequest> requests = courseRequestService.getMostRequestedCourses();
            return ResponseEntity.ok(ApiResponse.success("Most requested courses retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve most requested courses: " + e.getMessage()));
        }
    }
}
