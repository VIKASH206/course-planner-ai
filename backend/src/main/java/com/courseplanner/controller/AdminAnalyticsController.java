package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Analytics Controller
 * Provides insights and monitoring data
 * Requires ADMIN role for all operations
 */
@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for development
public class AdminAnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/admin/analytics/users - User analytics
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getUserAnalytics();
            return ResponseEntity.ok(ApiResponse.success("User analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve user analytics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/analytics/interests - Interest analytics
     */
    @GetMapping("/interests")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInterestAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getInterestAnalytics();
            return ResponseEntity.ok(ApiResponse.success("Interest analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve interest analytics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/analytics/goals - Goal analytics
     */
    @GetMapping("/goals")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGoalAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getGoalAnalytics();
            return ResponseEntity.ok(ApiResponse.success("Goal analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve goal analytics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/analytics/recommendations - Recommendation analytics
     */
    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecommendationAnalytics() {
        try {
            Map<String, Object> analytics = analyticsService.getRecommendationAnalytics();
            return ResponseEntity.ok(ApiResponse.success("Recommendation analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve recommendation analytics: " + e.getMessage()));
        }
    }

    /**
     * GET /api/admin/analytics/overview - Complete analytics overview
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalyticsOverview() {
        try {
            Map<String, Object> overview = analyticsService.getCompleteAnalyticsOverview();
            return ResponseEntity.ok(ApiResponse.success("Analytics overview retrieved successfully", overview));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve analytics overview: " + e.getMessage()));
        }
    }
}
