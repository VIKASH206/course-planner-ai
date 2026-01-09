package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class BadgeController {

    /**
     * Get all available badges
     */
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllBadges() {
        Map<String, Object> response = Map.of(
            "badges", List.of(
                Map.of("id", "1", "name", "First Course", "description", "Complete your first course", "category", "ACHIEVEMENT"),
                Map.of("id", "2", "name", "Quiz Master", "description", "Score 90%+ on 10 quizzes", "category", "PROGRESS"),
                Map.of("id", "3", "name", "Discussion Leader", "description", "Post 25 helpful forum replies", "category", "PARTICIPATION")
            ),
            "message", "Badge system API ready"
        );
        return ResponseEntity.ok(ApiResponse.success("All badges API ready", response));
    }
    
    /**
     * Get badges earned by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<?>> getUserBadges(@PathVariable String userId) {
        Map<String, Object> response = Map.of(
            "userId", userId,
            "earnedBadges", List.of(
                Map.of("badgeId", "1", "badgeName", "First Course", "earnedAt", "2024-01-15T10:30:00")
            ),
            "totalBadges", 1,
            "totalPoints", 50,
            "message", "User badges API ready"
        );
        return ResponseEntity.ok(ApiResponse.success("User badges API ready", response));
    }
    
    /**
     * Check for newly earned badges
     */
    @PostMapping("/check/{userId}")
    public ResponseEntity<ApiResponse<?>> checkForNewBadges(@PathVariable String userId) {
        Map<String, Object> response = Map.of(
            "userId", userId,
            "newBadges", List.of(),
            "message", "Badge checking logic API ready - criteria evaluation needed"
        );
        return ResponseEntity.ok(ApiResponse.success("Badge check completed", response));
    }
    
    /**
     * Get badge leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<?>> getBadgeLeaderboard() {
        Map<String, Object> response = Map.of(
            "leaderboard", List.of(
                Map.of("userId", "user1", "userName", "John Doe", "badgeCount", 15, "totalPoints", 750),
                Map.of("userId", "user2", "userName", "Jane Smith", "badgeCount", 12, "totalPoints", 600)
            ),
            "message", "Badge leaderboard API ready"
        );
        return ResponseEntity.ok(ApiResponse.success("Badge leaderboard API ready", response));
    }
    
    /**
     * Get badges by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<?>> getBadgesByCategory(@PathVariable String category) {
        Map<String, Object> response = Map.of(
            "category", category,
            "badges", List.of(),
            "message", "Badges by category API ready"
        );
        return ResponseEntity.ok(ApiResponse.success("Badges by category API ready", response));
    }
}