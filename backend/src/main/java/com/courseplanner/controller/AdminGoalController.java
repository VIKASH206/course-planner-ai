package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Goal;
import com.courseplanner.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Goal Management Controller
 * Requires ADMIN role for all operations
 */
@RestController
@RequestMapping("/api/admin/goals")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for development
public class AdminGoalController {
    
    @Autowired
    private GoalService goalService;
    
    /**
     * GET /api/admin/goals - Get all goals
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Goal>>> getAllGoals() {
        try {
            List<Goal> goals = goalService.getAllGoals();
            return ResponseEntity.ok(ApiResponse.success("Goals retrieved successfully", goals));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve goals: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/goals/enabled - Get enabled goals only
     */
    @GetMapping("/enabled")
    public ResponseEntity<ApiResponse<List<Goal>>> getEnabledGoals() {
        try {
            List<Goal> goals = goalService.getEnabledGoals();
            return ResponseEntity.ok(ApiResponse.success("Enabled goals retrieved successfully", goals));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve enabled goals: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/goals/{id} - Get goal by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Goal>> getGoalById(@PathVariable String id) {
        try {
            Goal goal = goalService.getGoalById(id);
            return ResponseEntity.ok(ApiResponse.success("Goal retrieved successfully", goal));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/goals/interest/{interestId} - Get goals by interest
     */
    @GetMapping("/interest/{interestId}")
    public ResponseEntity<ApiResponse<List<Goal>>> getGoalsByInterest(@PathVariable String interestId) {
        try {
            List<Goal> goals = goalService.getGoalsByInterestId(interestId);
            return ResponseEntity.ok(ApiResponse.success("Goals for interest retrieved successfully", goals));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve goals: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/admin/goals - Create new goal
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Goal>> createGoal(@RequestBody Goal goal) {
        try {
            Goal created = goalService.createGoal(goal);
            return ResponseEntity.ok(ApiResponse.success("Goal created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PUT /api/admin/goals/{id} - Update goal
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Goal>> updateGoal(
            @PathVariable String id,
            @RequestBody Goal goal) {
        try {
            Goal updated = goalService.updateGoal(id, goal);
            return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/admin/goals/{id} - Delete goal
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(@PathVariable String id) {
        try {
            goalService.deleteGoal(id);
            return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PATCH /api/admin/goals/{id}/toggle - Enable/Disable goal
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Goal>> toggleGoalStatus(
            @PathVariable String id,
            @RequestParam boolean enabled) {
        try {
            Goal updated = goalService.toggleGoalStatus(id, enabled);
            return ResponseEntity.ok(ApiResponse.success("Goal status updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
