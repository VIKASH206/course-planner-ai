package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.CourseRequest;
import com.courseplanner.service.CourseRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/course-requests")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class CourseRequestController {

    @Autowired
    private CourseRequestService courseRequestService;

    /**
     * GET /api/course-requests - Get all course requests
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseRequest>>> getAllCourseRequests(
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve course requests: " + e.getMessage()));
        }
    }

    /**
     * GET /api/course-requests/{id} - Get course request by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseRequest>> getCourseRequest(@PathVariable String id) {
        try {
            CourseRequest request = courseRequestService.getCourseRequestById(id);
            return ResponseEntity.ok(ApiResponse.success("Course request retrieved successfully", request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course request not found: " + e.getMessage()));
        }
    }

    /**
     * GET /api/course-requests/stats - Get statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CourseRequestService.CourseRequestStats>> getStatistics() {
        try {
            CourseRequestService.CourseRequestStats stats = courseRequestService.getStatistics();
            return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/course-requests/most-requested - Get most requested courses
     */
    @GetMapping("/most-requested")
    public ResponseEntity<ApiResponse<List<CourseRequest>>> getMostRequestedCourses() {
        try {
            List<CourseRequest> requests = courseRequestService.getMostRequestedCourses();
            return ResponseEntity.ok(ApiResponse.success("Most requested courses retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve most requested courses: " + e.getMessage()));
        }
    }

    /**
     * GET /api/course-requests/recent - Get recently requested courses
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<CourseRequest>>> getRecentlyRequestedCourses() {
        try {
            List<CourseRequest> requests = courseRequestService.getRecentlyRequestedCourses();
            return ResponseEntity.ok(ApiResponse.success("Recently requested courses retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recently requested courses: " + e.getMessage()));
        }
    }

    /**
     * POST /api/course-requests - Create or increment course request
     * Body: { "interest": "Course Name", "level": "Beginner" }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseRequest>> createCourseRequest(@RequestBody Map<String, String> requestBody) {
        try {
            String interest = requestBody.get("interest");
            String level = requestBody.get("level");
            
            if (interest == null || interest.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Interest is required"));
            }
            if (level == null || level.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Level is required"));
            }
            
            CourseRequest request = courseRequestService.createOrIncrementCourseRequest(interest, level);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Course request created/updated successfully", request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create course request: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/course-requests/{id} - Update course request
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseRequest>> updateCourseRequest(
            @PathVariable String id,
            @RequestBody CourseRequest updatedRequest) {
        try {
            CourseRequest request = courseRequestService.updateCourseRequest(id, updatedRequest);
            return ResponseEntity.ok(ApiResponse.success("Course request updated successfully", request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course request not found: " + e.getMessage()));
        }
    }

    /**
     * PATCH /api/course-requests/{id}/status - Update status
     * Body: { "status": "Planned" }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CourseRequest>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> requestBody) {
        try {
            String status = requestBody.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Status is required"));
            }
            
            CourseRequest request = courseRequestService.updateStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course request not found: " + e.getMessage()));
        }
    }

    /**
     * PATCH /api/course-requests/{id}/mark-planned - Mark as planned
     */
    @PatchMapping("/{id}/mark-planned")
    public ResponseEntity<ApiResponse<CourseRequest>> markAsPlanned(@PathVariable String id) {
        try {
            CourseRequest request = courseRequestService.markAsPlanned(id);
            return ResponseEntity.ok(ApiResponse.success("Marked as planned successfully", request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course request not found: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/course-requests/{id} - Delete course request
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourseRequest(@PathVariable String id) {
        try {
            courseRequestService.deleteCourseRequest(id);
            return ResponseEntity.ok(ApiResponse.success("Course request deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Course request not found: " + e.getMessage()));
        }
    }
}
