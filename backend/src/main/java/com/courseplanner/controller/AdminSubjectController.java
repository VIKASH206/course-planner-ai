package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Subject;
import com.courseplanner.service.SubjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Subject Management Controller
 * Requires ADMIN role for all operations
 */
@RestController
@RequestMapping("/api/admin/subjects")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for development
public class AdminSubjectController {
    
    @Autowired
    private SubjectService subjectService;
    
    /**
     * GET /api/admin/subjects - Get all subjects
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        try {
            List<Subject> subjects = subjectService.getAllSubjects();
            return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve subjects: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/subjects/enabled - Get enabled subjects only
     */
    @GetMapping("/enabled")
    public ResponseEntity<ApiResponse<List<Subject>>> getEnabledSubjects() {
        try {
            List<Subject> subjects = subjectService.getEnabledSubjects();
            return ResponseEntity.ok(ApiResponse.success("Enabled subjects retrieved successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve enabled subjects: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/subjects/{id} - Get subject by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Subject>> getSubjectById(@PathVariable String id) {
        try {
            Subject subject = subjectService.getSubjectById(id);
            return ResponseEntity.ok(ApiResponse.success("Subject retrieved successfully", subject));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/subjects/interest/{interestId} - Get subjects by interest
     */
    @GetMapping("/interest/{interestId}")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByInterest(@PathVariable String interestId) {
        try {
            List<Subject> subjects = subjectService.getSubjectsByInterestId(interestId);
            return ResponseEntity.ok(ApiResponse.success("Subjects for interest retrieved successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve subjects: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/subjects/goal/{goalId} - Get subjects by goal
     */
    @GetMapping("/goal/{goalId}")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByGoal(@PathVariable String goalId) {
        try {
            List<Subject> subjects = subjectService.getSubjectsByGoalId(goalId);
            return ResponseEntity.ok(ApiResponse.success("Subjects for goal retrieved successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve subjects: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/subjects/filter - Get subjects by interest and goal
     */
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByInterestAndGoal(
            @RequestParam String interestId,
            @RequestParam String goalId) {
        try {
            List<Subject> subjects = subjectService.getSubjectsByInterestAndGoal(interestId, goalId);
            return ResponseEntity.ok(ApiResponse.success("Filtered subjects retrieved successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve subjects: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/subjects/difficulty/{level} - Get subjects by difficulty
     */
    @GetMapping("/difficulty/{level}")
    public ResponseEntity<ApiResponse<List<Subject>>> getSubjectsByDifficulty(@PathVariable String level) {
        try {
            List<Subject> subjects = subjectService.getSubjectsByDifficulty(level);
            return ResponseEntity.ok(ApiResponse.success("Subjects by difficulty retrieved successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve subjects: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/admin/subjects - Create new subject
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Subject>> createSubject(@RequestBody Subject subject) {
        try {
            Subject created = subjectService.createSubject(subject);
            return ResponseEntity.ok(ApiResponse.success("Subject created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PUT /api/admin/subjects/{id} - Update subject
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Subject>> updateSubject(
            @PathVariable String id,
            @RequestBody Subject subject) {
        try {
            Subject updated = subjectService.updateSubject(id, subject);
            return ResponseEntity.ok(ApiResponse.success("Subject updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/admin/subjects/{id} - Delete subject
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable String id) {
        try {
            subjectService.deleteSubject(id);
            return ResponseEntity.ok(ApiResponse.success("Subject deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PATCH /api/admin/subjects/{id}/toggle - Enable/Disable subject
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Subject>> toggleSubjectStatus(
            @PathVariable String id,
            @RequestParam boolean enabled) {
        try {
            Subject updated = subjectService.toggleSubjectStatus(id, enabled);
            return ResponseEntity.ok(ApiResponse.success("Subject status updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
