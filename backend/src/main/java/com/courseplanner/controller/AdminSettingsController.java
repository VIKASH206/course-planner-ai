package com.courseplanner.controller;

import com.courseplanner.model.PlatformSettings;
import com.courseplanner.service.PlatformSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for admin platform settings management
 */
@RestController
@RequestMapping("/api/admin/settings")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true", maxAge = 3600)
public class AdminSettingsController {
    private static final Logger logger = LoggerFactory.getLogger(AdminSettingsController.class);

    @Autowired
    private PlatformSettingsService settingsService;

    /**
     * GET /api/admin/settings/platform
     * Get current platform settings
     */
    @GetMapping("/platform")
    public ResponseEntity<Map<String, Object>> getPlatformSettings() {
        try {
            PlatformSettings settings = settingsService.getSettings();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("settings", settings);
            response.put("message", "Platform settings retrieved successfully");
            
            logger.info("✅ Platform settings retrieved");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving platform settings: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve platform settings");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * POST /api/admin/settings/platform
     * Update platform settings
     */
    @PostMapping("/platform")
    public ResponseEntity<Map<String, Object>> updatePlatformSettings(
            @RequestBody PlatformSettings newSettings,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            
            PlatformSettings updatedSettings = settingsService.updateSettings(newSettings, username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("settings", updatedSettings);
            response.put("message", "Platform settings updated successfully");
            
            logger.info("✅ Platform settings updated by: {}", username);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error updating platform settings: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update platform settings");
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * GET /api/admin/settings/summary
     * Get settings summary for dashboard
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSettingsSummary() {
        try {
            Map<String, Object> summary = settingsService.getSettingsSummary();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("summary", summary);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error retrieving settings summary: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve settings summary");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * GET /api/admin/settings/feature/{featureName}
     * Check if a specific feature is enabled
     */
    @GetMapping("/feature/{featureName}")
    public ResponseEntity<Map<String, Object>> checkFeatureStatus(@PathVariable String featureName) {
        try {
            boolean isEnabled = settingsService.isFeatureEnabled(featureName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("featureName", featureName);
            response.put("enabled", isEnabled);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error checking feature status: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to check feature status");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * PUT /api/admin/settings/feature/{featureName}
     * Toggle a specific feature on/off
     */
    @PutMapping("/feature/{featureName}")
    public ResponseEntity<Map<String, Object>> toggleFeature(
            @PathVariable String featureName,
            @RequestParam boolean enabled,
            Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            
            PlatformSettings settings = settingsService.getSettings();
            
            // Update the specific feature
            switch (featureName.toLowerCase()) {
                case "ai":
                case "ai_enabled":
                    settings.setAiEnabled(enabled);
                    break;
                case "email":
                case "email_notifications":
                    settings.setEmailNotifications(enabled);
                    break;
                case "registration":
                case "registration_enabled":
                    settings.setRegistrationEnabled(enabled);
                    break;
                case "gamification":
                case "gamification_enabled":
                    settings.setGamificationEnabled(enabled);
                    break;
                default:
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("success", false);
                    errorResponse.put("message", "Unknown feature name: " + featureName);
                    return ResponseEntity.badRequest().body(errorResponse);
            }
            
            PlatformSettings updated = settingsService.updateSettings(settings, username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("featureName", featureName);
            response.put("enabled", enabled);
            response.put("settings", updated);
            response.put("message", featureName + " " + (enabled ? "enabled" : "disabled") + " successfully");
            
            logger.info("✅ Feature {} {} by {}", featureName, enabled ? "enabled" : "disabled", username);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error toggling feature: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to toggle feature");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
