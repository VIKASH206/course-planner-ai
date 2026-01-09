package com.courseplanner.controller;

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
@RequestMapping("/api/activities")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class ActivityController {
    
    @Autowired
    private ActivityService activityService;
    
    /**
     * Get recent activities for student dashboard
     */
    @GetMapping("/student/recent")
    public ResponseEntity<?> getRecentActivitiesForStudent(Authentication authentication) {
        try {
            List<Activity> activities = activityService.getRecentActivitiesForStudent();
            
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
     * Get all activities for student dashboard
     */
    @GetMapping("/student/all")
    public ResponseEntity<?> getAllActivitiesForStudent(Authentication authentication) {
        try {
            List<Activity> activities = activityService.getAllActivitiesForStudent();
            
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
}
