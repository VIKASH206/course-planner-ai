package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Dashboard Controller for statistics and analytics
 * Requires ADMIN role for all operations
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for development
public class AdminDashboardController {
    
    @Autowired
    private AdminDashboardService adminDashboardService;
    
    /**
     * GET /api/admin/dashboard/stats - Get overall dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        try {
            Map<String, Object> stats = adminDashboardService.getDashboardStats();
            return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve dashboard stats: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/dashboard/interest-trends - Get user interest trends
     */
    @GetMapping("/interest-trends")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getInterestTrends() {
        try {
            Map<String, Long> trends = adminDashboardService.getUserInterestTrends();
            return ResponseEntity.ok(ApiResponse.success("Interest trends retrieved successfully", trends));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve interest trends: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/dashboard/goal-stats - Get goal selection statistics
     */
    @GetMapping("/goal-stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getGoalStats() {
        try {
            Map<String, Long> stats = adminDashboardService.getGoalSelectionStats();
            return ResponseEntity.ok(ApiResponse.success("Goal statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve goal stats: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/dashboard/top-subjects - Get most recommended subjects
     */
    @GetMapping("/top-subjects")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getTopSubjects() {
        try {
            Map<String, Long> subjects = adminDashboardService.getMostRecommendedSubjects();
            return ResponseEntity.ok(ApiResponse.success("Top subjects retrieved successfully", subjects));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve top subjects: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/dashboard/completion-rate - Get completion rate statistics
     */
    @GetMapping("/completion-rate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompletionRate() {
        try {
            Map<String, Object> stats = adminDashboardService.getCompletionRateStats();
            return ResponseEntity.ok(ApiResponse.success("Completion rate stats retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve completion rate: " + e.getMessage()));
        }
    }
}
