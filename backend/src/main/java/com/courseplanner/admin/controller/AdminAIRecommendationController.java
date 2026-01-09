package com.courseplanner.admin.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.AIRecommendationLog;
import com.courseplanner.model.Interest;
import com.courseplanner.model.User;
import com.courseplanner.repository.AIRecommendationLogRepository;
import com.courseplanner.repository.InterestRepository;
import com.courseplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin controller for viewing AI Recommendation Logs
 */
@RestController
@RequestMapping("/api/admin/ai-recommendation-logs")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AdminAIRecommendationController {
    
    @Autowired
    private AIRecommendationLogRepository aiRecommendationLogRepository;
    
    @Autowired
    private InterestRepository interestRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * GET /api/admin/ai-recommendation-logs - Get all AI recommendation logs with filtering
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllLogs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String interest,
            @RequestParam(required = false) String search) {
        try {
            // Get all logs sorted by most recent first
            List<AIRecommendationLog> logs = aiRecommendationLogRepository
                    .findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
            
            // Apply search filter
            if (search != null && !search.trim().isEmpty()) {
                String searchLower = search.toLowerCase().trim();
                logs = logs.stream()
                        .filter(log -> 
                            (log.getUsername() != null && log.getUsername().toLowerCase().contains(searchLower)) ||
                            (log.getUserId() != null && log.getUserId().toLowerCase().contains(searchLower)))
                        .collect(Collectors.toList());
            }
            
            // Transform logs to include additional info
            List<Map<String, Object>> enrichedLogs = logs.stream()
                    .map(log -> {
                        Map<String, Object> enrichedLog = new HashMap<>();
                        enrichedLog.put("id", log.getId());
                        enrichedLog.put("userId", log.getUserId());
                        enrichedLog.put("username", log.getUsername());
                        enrichedLog.put("recommendationCount", log.getRecommendationCount());
                        enrichedLog.put("recommendationType", log.getRecommendationType());
                        enrichedLog.put("createdAt", log.getCreatedAt());
                        
                        // Fetch user's current interests
                        String userInterest = getUserCurrentInterest(log.getUserId());
                        
                        // Add display-friendly fields
                        enrichedLog.put("interest", userInterest);
                        enrichedLog.put("status", log.getStatus() != null ? log.getStatus() : "Success");
                        enrichedLog.put("level", getRecommendationLevel(log.getRecommendationCount()));
                        enrichedLog.put("recommendedCourses", log.getRecommendationCount() + " courses");
                        
                        return enrichedLog;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("logs", enrichedLogs);
            response.put("total", enrichedLogs.size());
            response.put("availableInterests", getAvailableInterests());
            
            return ResponseEntity.ok(ApiResponse.success("AI recommendation logs retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve logs: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/ai-recommendation-logs/stats - Get statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        try {
            long totalLogs = aiRecommendationLogRepository.count();
            
            // Get today's logs
            LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
            long todayLogs = aiRecommendationLogRepository.countByCreatedAtBetween(startOfDay, endOfDay);
            
            // Get this week's logs
            LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
            long weekLogs = aiRecommendationLogRepository.countByCreatedAtBetween(startOfWeek, LocalDateTime.now());
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalLogs", totalLogs);
            stats.put("todayLogs", todayLogs);
            stats.put("weekLogs", weekLogs);
            
            return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/ai-recommendation-logs/{id} - Get specific log details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AIRecommendationLog>> getLogById(@PathVariable String id) {
        try {
            AIRecommendationLog log = aiRecommendationLogRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Log not found with id: " + id));
            
            return ResponseEntity.ok(ApiResponse.success("Log retrieved successfully", log));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/admin/ai-recommendation-logs/{id} - Delete a log
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLog(@PathVariable String id) {
        try {
            if (!aiRecommendationLogRepository.existsById(id)) {
                throw new RuntimeException("Log not found with id: " + id);
            }
            
            aiRecommendationLogRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Log deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // Helper methods
    
    private String getRecommendationLevel(int count) {
        if (count <= 3) return "Basic";
        if (count <= 6) return "Intermediate";
        return "Advanced";
    }
    
    private List<String> getAvailableInterests() {
        return interestRepository.findByEnabledOrderByOrderIndexAsc(true)
                .stream()
                .map(Interest::getName)
                .collect(Collectors.toList());
    }
    
    private String getUserCurrentInterest(String userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getInterests() != null && !user.getInterests().isEmpty()) {
                // Interests are stored as strings directly, not IDs
                return user.getInterests().get(0);
            }
        } catch (Exception e) {
            // If any error, return N/A
        }
        return "N/A";
    }
}
