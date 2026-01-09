package com.courseplanner.admin.controller;

import com.courseplanner.model.Activity;
import com.courseplanner.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/activities")
@CrossOrigin(origins = "*")
public class AdminActivityController {
    
    @Autowired
    private ActivityService activityService;
    
    /**
     * Get recent activities for admin dashboard
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentActivities(Authentication authentication) {
        try {
            List<Activity> activities = activityService.getRecentActivitiesForAdmin();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", activities);
            response.put("count", activities.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch activities: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get all activities for admin dashboard
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllActivities(Authentication authentication) {
        try {
            List<Activity> activities = activityService.getAllActivitiesForAdmin();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", activities);
            response.put("count", activities.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch activities: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Get activities for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserActivities(@PathVariable String userId) {
        try {
            List<Activity> activities = activityService.getUserActivities(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", activities);
            response.put("count", activities.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to fetch user activities: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
