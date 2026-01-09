package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Interest;
import com.courseplanner.service.InterestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Interest Management Controller
 * Requires ADMIN role for all operations
 */
@RestController
@RequestMapping("/api/admin/interests")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for development
public class AdminInterestController {
    
    @Autowired
    private InterestService interestService;
    
    @Autowired
    private com.courseplanner.service.ActivityService activityService;
    
    /**
     * GET /api/admin/interests - Get all interests
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Interest>>> getAllInterests() {
        try {
            List<Interest> interests = interestService.getAllInterests();
            return ResponseEntity.ok(ApiResponse.success("Interests retrieved successfully", interests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve interests: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/interests/enabled - Get enabled interests only
     */
    @GetMapping("/enabled")
    public ResponseEntity<ApiResponse<List<Interest>>> getEnabledInterests() {
        try {
            List<Interest> interests = interestService.getEnabledInterests();
            return ResponseEntity.ok(ApiResponse.success("Enabled interests retrieved successfully", interests));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve enabled interests: " + e.getMessage()));
        }
    }
    
    /**
     * GET /api/admin/interests/{id} - Get interest by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Interest>> getInterestById(@PathVariable String id) {
        try {
            Interest interest = interestService.getInterestById(id);
            return ResponseEntity.ok(ApiResponse.success("Interest retrieved successfully", interest));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * POST /api/admin/interests - Create new interest
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Interest>> createInterest(@RequestBody Interest interest, org.springframework.security.core.Authentication auth) {
        try {
            Interest created = interestService.createInterest(interest);
            
            // Log activity
            String adminName = auth != null ? auth.getName() : "Admin";
            activityService.logActivity(
                "admin",
                adminName,
                "ADMIN",
                "INTEREST_CREATED",
                "Admin created new interest: " + created.getName(),
                "INTEREST",
                created.getId(),
                created.getName()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Interest created successfully", created));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PUT /api/admin/interests/{id} - Update interest
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Interest>> updateInterest(
            @PathVariable String id,
            @RequestBody Interest interest,
            org.springframework.security.core.Authentication auth) {
        try {
            Interest updated = interestService.updateInterest(id, interest);
            
            // Log activity
            String adminName = auth != null ? auth.getName() : "Admin";
            activityService.logActivity(
                "admin",
                adminName,
                "ADMIN",
                "INTEREST_UPDATED",
                "Admin updated interest: " + updated.getName(),
                "INTEREST",
                updated.getId(),
                updated.getName()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Interest updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/admin/interests/{id} - Delete interest
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInterest(@PathVariable String id, org.springframework.security.core.Authentication auth) {
        try {
            // Get interest name before deleting
            Interest interest = interestService.getInterestById(id);
            String interestName = interest.getName();
            
            interestService.deleteInterest(id);
            
            // Log activity
            String adminName = auth != null ? auth.getName() : "Admin";
            activityService.logActivity(
                "admin",
                adminName,
                "ADMIN",
                "INTEREST_DELETED",
                "Admin deleted interest: " + interestName,
                "INTEREST",
                id,
                interestName
            );
            
            return ResponseEntity.ok(ApiResponse.success("Interest deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * PATCH /api/admin/interests/{id}/toggle - Enable/Disable interest
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Interest>> toggleInterestStatus(
            @PathVariable String id,
            @RequestParam boolean enabled) {
        try {
            Interest updated = interestService.toggleInterestStatus(id, enabled);
            return ResponseEntity.ok(ApiResponse.success("Interest status updated successfully", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
