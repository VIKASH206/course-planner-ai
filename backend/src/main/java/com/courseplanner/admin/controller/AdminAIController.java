package com.courseplanner.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AdminAIController {

    /**
     * GET /api/admin/ai/health - Get AI service health status
     */
    @GetMapping("/health")
    public ResponseEntity<?> getAIHealth() {
        try {
            Map<String, Object> health = new HashMap<>();
            health.put("status", "Active");
            health.put("lastRun", "Just now");
            health.put("errorCount", 0);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", health);
            response.put("message", "AI service is running");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get AI health: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
