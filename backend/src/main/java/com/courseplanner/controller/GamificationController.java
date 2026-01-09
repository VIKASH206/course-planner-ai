package com.courseplanner.controller;

import com.courseplanner.service.GamificationService;
import com.courseplanner.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gamification Controller - Manages all gamification features
 */
@RestController
@RequestMapping("/api/gamification")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    /**
     * Test endpoint to check service health
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Gamification service is running");
        return ResponseEntity.ok(response);
    }

    /**
     * Get user's gamification stats
     */
    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable String userId) {
        try {
            // Get or create user gamification data
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User stats retrieved successfully");
            
            Map<String, Object> stats = gamificationService.getUserRank(userId);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error in getUserStats: " + e.getMessage());
            
            // Return default data instead of error
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Default stats returned");
            
            Map<String, Object> defaultStats = new HashMap<>();
            defaultStats.put("userId", userId);
            defaultStats.put("name", "User");
            defaultStats.put("level", 1);
            defaultStats.put("xp", 0);
            defaultStats.put("xpToNextLevel", 500);
            defaultStats.put("badges", 0);
            defaultStats.put("streak", 0);
            defaultStats.put("hoursStudied", 0);
            defaultStats.put("rank", "Unranked");
            defaultStats.put("totalUsers", 1);
            
            response.put("data", defaultStats);
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Get leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaderboard(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> leaderboard = gamificationService.getLeaderboard(limit);
            return ResponseEntity.ok(ApiResponse.success("Leaderboard retrieved successfully", leaderboard));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve leaderboard: " + e.getMessage()));
        }
    }

    /**
     * Get user's rank
     */
    @GetMapping("/rank/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserRank(@PathVariable String userId) {
        try {
            Map<String, Object> rankInfo = gamificationService.getUserRank(userId);
            return ResponseEntity.ok(ApiResponse.success("User rank retrieved successfully", rankInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve user rank: " + e.getMessage()));
        }
    }

    /**
     * Add XP to user
     */
    @PostMapping("/xp/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addXP(
            @PathVariable String userId,
            @RequestParam int xp,
            @RequestParam(required = false, defaultValue = "Manual XP addition") String reason) {
        try {
            Map<String, Object> result = gamificationService.addXP(userId, xp, reason);
            return ResponseEntity.ok(ApiResponse.success("XP added successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to add XP: " + e.getMessage()));
        }
    }

    /**
     * Update daily streak
     */
    @PostMapping("/streak/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStreak(@PathVariable String userId) {
        try {
            System.out.println("[GAMIFICATION] Update streak for userId: " + userId);
            Map<String, Object> result = gamificationService.updateStreak(userId);
            return ResponseEntity.ok(ApiResponse.success("Streak updated successfully", result));
        } catch (Exception e) {
            System.err.println("[GAMIFICATION ERROR] Failed to update streak for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update streak: " + e.getMessage()));
        }
    }

    /**
     * Get all badges with user's progress
     */
    @GetMapping("/badges/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserBadges(@PathVariable String userId) {
        try {
            System.out.println("[GAMIFICATION] Get badges for userId: " + userId);
            List<Map<String, Object>> badges = gamificationService.getAllBadgesWithProgress(userId);
            return ResponseEntity.ok(ApiResponse.success("Badges retrieved successfully", badges));
        } catch (Exception e) {
            System.err.println("[GAMIFICATION ERROR] Failed to retrieve badges for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve badges: " + e.getMessage()));
        }
    }

    /**
     * Get active quests for user
     */
    @GetMapping("/quests/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUserQuests(@PathVariable String userId) {
        try {
            System.out.println("[GAMIFICATION] Get quests for userId: " + userId);
            List<Map<String, Object>> quests = gamificationService.getActiveQuests(userId);
            return ResponseEntity.ok(ApiResponse.success("Quests retrieved successfully", quests));
        } catch (Exception e) {
            System.err.println("[GAMIFICATION ERROR] Failed to retrieve quests for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve quests: " + e.getMessage()));
        }
    }

    /**
     * Update quest progress
     */
    @PostMapping("/quests/{userId}/{questId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateQuestProgress(
            @PathVariable String userId,
            @PathVariable String questId,
            @RequestParam(defaultValue = "1") int increment) {
        try {
            Map<String, Object> result = gamificationService.updateQuestProgress(userId, questId, increment);
            return ResponseEntity.ok(ApiResponse.success("Quest progress updated successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update quest progress: " + e.getMessage()));
        }
    }

    /**
     * Get available rewards
     */
    @GetMapping("/rewards/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableRewards(@PathVariable String userId) {
        try {
            System.out.println("[GAMIFICATION] Get rewards for userId: " + userId);
            List<Map<String, Object>> rewards = gamificationService.getAvailableRewards(userId);
            return ResponseEntity.ok(ApiResponse.success("Rewards retrieved successfully", rewards));
        } catch (Exception e) {
            System.err.println("[GAMIFICATION ERROR] Failed to retrieve rewards for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve rewards: " + e.getMessage()));
        }
    }

    /**
     * Purchase reward
     */
    @PostMapping("/rewards/{userId}/{rewardId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> purchaseReward(
            @PathVariable String userId,
            @PathVariable String rewardId) {
        try {
            Map<String, Object> result = gamificationService.purchaseReward(userId, rewardId);
            return ResponseEntity.ok(ApiResponse.success("Reward purchased successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to purchase reward: " + e.getMessage()));
        }
    }

    /**
     * Update user statistic
     */
    @PostMapping("/statistics/{userId}")
    public ResponseEntity<ApiResponse<String>> updateStatistic(
            @PathVariable String userId,
            @RequestParam String statisticName,
            @RequestParam int value) {
        try {
            gamificationService.updateStatistic(userId, statisticName, value);
            return ResponseEntity.ok(ApiResponse.success("Statistic updated successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update statistic: " + e.getMessage()));
        }
    }

    /**
     * Increment user statistic
     */
    @PostMapping("/statistics/{userId}/increment")
    public ResponseEntity<ApiResponse<String>> incrementStatistic(
            @PathVariable String userId,
            @RequestParam String statisticName,
            @RequestParam(defaultValue = "1") int increment) {
        try {
            gamificationService.incrementStatistic(userId, statisticName, increment);
            return ResponseEntity.ok(ApiResponse.success("Statistic incremented successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to increment statistic: " + e.getMessage()));
        }
    }

    /**
     * Initialize default gamification data (badges, quests, rewards)
     */
    @PostMapping("/initialize")
    public ResponseEntity<ApiResponse<String>> initializeDefaultData() {
        try {
            gamificationService.initializeDefaultBadges();
            gamificationService.initializeDefaultQuests();
            gamificationService.initializeDefaultRewards();
            return ResponseEntity.ok(ApiResponse.success("Default gamification data initialized", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to initialize data: " + e.getMessage()));
        }
    }
}
