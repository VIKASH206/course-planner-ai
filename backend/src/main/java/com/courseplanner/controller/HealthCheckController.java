package com.courseplanner.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Provides a simple public endpoint for monitoring services (UptimeRobot, etc.)
 * 
 * This endpoint:
 * - Does NOT require authentication
 * - Does NOT access database
 * - Returns immediately with 200 OK
 * - Perfect for waking up sleeping Render instances
 */
@RestController
@CrossOrigin(origins = "*")  // Allow all origins for health checks
public class HealthCheckController {

    /**
     * GET /health - Simple health check endpoint
     * Returns HTTP 200 with "OK" text
     * 
     * This endpoint is designed for:
     * - UptimeRobot monitoring
     * - Load balancer health checks
     * - Render free tier wake-up pings
     * 
     * @return Plain text "OK" with HTTP 200
     */
    @GetMapping(value = "/health", produces = "text/plain")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("OK");
    }

    /**
     * GET /health/detailed - Detailed health check with JSON response
     * Returns HTTP 200 with JSON containing status and timestamp
     * 
     * @return JSON response with health details
     */
    @GetMapping(value = "/health/detailed", produces = "application/json")
    public ResponseEntity<Map<String, Object>> detailedHealthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Course Planner Backend");
        health.put("timestamp", System.currentTimeMillis());
        health.put("message", "Service is running");
        
        return ResponseEntity.ok(health);
    }

    /**
     * GET / - Root endpoint health check
     * Returns HTTP 200 to prevent 503 errors on root URL
     * 
     * @return Simple OK message
     */
    @GetMapping(value = "/", produces = "application/json")
    public ResponseEntity<Map<String, String>> rootHealthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Course Planner API is running");
        
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/health - Alternative health endpoint under /api
     * Some monitoring tools prefer /api/health
     * 
     * @return Plain text "OK" with HTTP 200
     */
    @GetMapping(value = "/api/health", produces = "text/plain")
    public ResponseEntity<String> apiHealthCheck() {
        return ResponseEntity.ok("OK");
    }
}
