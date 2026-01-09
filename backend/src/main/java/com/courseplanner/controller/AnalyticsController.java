package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Analytics;
import com.courseplanner.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get today's analytics for a user
     */
    @GetMapping("/today/{userId}")
    public ResponseEntity<ApiResponse<Analytics>> getTodayAnalytics(@PathVariable String userId) {
        try {
            Analytics analytics = analyticsService.getTodayAnalytics(userId);
            return ResponseEntity.ok(ApiResponse.success("Today's analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve today's analytics: " + e.getMessage()));
        }
    }

    /**
     * Get weekly analytics for a user
     */
    @GetMapping("/weekly/{userId}")
    public ResponseEntity<ApiResponse<List<Analytics>>> getWeeklyAnalytics(@PathVariable String userId) {
        try {
            List<Analytics> analytics = analyticsService.getWeeklyAnalytics(userId);
            return ResponseEntity.ok(ApiResponse.success("Weekly analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve weekly analytics: " + e.getMessage()));
        }
    }

    /**
     * Get monthly analytics for a user
     */
    @GetMapping("/monthly/{userId}")
    public ResponseEntity<ApiResponse<List<Analytics>>> getMonthlyAnalytics(@PathVariable String userId) {
        try {
            List<Analytics> analytics = analyticsService.getMonthlyAnalytics(userId);
            return ResponseEntity.ok(ApiResponse.success("Monthly analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve monthly analytics: " + e.getMessage()));
        }
    }

    /**
     * Get user progress summary
     */
    @GetMapping("/summary/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserProgressSummary(@PathVariable String userId) {
        try {
            Map<String, Object> summary = analyticsService.getUserProgressSummary(userId);
            return ResponseEntity.ok(ApiResponse.success("Progress summary retrieved successfully", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve progress summary: " + e.getMessage()));
        }
    }

    /**
     * Get detailed analytics report
     */
    @GetMapping("/detailed/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDetailedAnalytics(@PathVariable String userId) {
        try {
            Map<String, Object> report = analyticsService.getDetailedAnalytics(userId);
            return ResponseEntity.ok(ApiResponse.success("Detailed analytics retrieved successfully", report));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve detailed analytics: " + e.getMessage()));
        }
    }

    /**
     * Analyze weak and strong areas
     */
    @GetMapping("/areas-analysis/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzeWeakStrongAreas(@PathVariable String userId) {
        try {
            Map<String, Object> analysis = analyticsService.analyzeWeakStrongAreas(userId);
            return ResponseEntity.ok(ApiResponse.success("Areas analysis completed successfully", analysis));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to analyze areas: " + e.getMessage()));
        }
    }

    /**
     * Get current streak for a user
     */
    @GetMapping("/streak/{userId}")
    public ResponseEntity<ApiResponse<Integer>> getUserStreak(@PathVariable String userId) {
        try {
            int streak = analyticsService.calculateStreak(userId);
            return ResponseEntity.ok(ApiResponse.success("Streak calculated successfully", streak));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to calculate streak: " + e.getMessage()));
        }
    }
}

// Note: GamificationController has been moved to a separate file
// See: com.courseplanner.controller.GamificationController
// This old implementation is kept for reference but commented out to avoid duplicate class error

/*
 * Old Gamification Controller - has been replaced with comprehensive new version
 * The new controller is located at:
 * backend/src/main/java/com/courseplanner/controller/GamificationController.java
 */