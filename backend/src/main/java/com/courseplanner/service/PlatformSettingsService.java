package com.courseplanner.service;

import com.courseplanner.model.PlatformSettings;
import com.courseplanner.repository.PlatformSettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for managing platform-wide settings
 */
@Service
public class PlatformSettingsService {
    private static final Logger logger = LoggerFactory.getLogger(PlatformSettingsService.class);

    @Autowired
    private PlatformSettingsRepository settingsRepository;

    /**
     * Initialize default settings on application startup
     */
    @PostConstruct
    public void initializeSettings() {
        try {
            PlatformSettings settings = settingsRepository.findFirstByOrderByUpdatedAtDesc();
            if (settings == null) {
                logger.info("📝 Initializing default platform settings...");
                PlatformSettings defaultSettings = new PlatformSettings();
                defaultSettings.setAiEnabled(true);
                defaultSettings.setEmailNotifications(true);
                defaultSettings.setRegistrationEnabled(true);
                defaultSettings.setGamificationEnabled(true);
                defaultSettings.setUpdatedAt(LocalDateTime.now());
                defaultSettings.setUpdatedBy("system");
                defaultSettings.setVersion("1.0");
                
                settingsRepository.save(defaultSettings);
                logger.info("✅ Default platform settings created successfully");
            } else {
                logger.info("✅ Platform settings already exist");
            }
        } catch (Exception e) {
            logger.error("❌ Error initializing platform settings", e);
        }
    }

    /**
     * Get current platform settings (creates default if not exists)
     */
    public PlatformSettings getSettings() {
        try {
            PlatformSettings settings = settingsRepository.findFirstByOrderByUpdatedAtDesc();
            
            if (settings == null) {
                logger.info("📝 Creating default platform settings");
                settings = new PlatformSettings();
                settings = settingsRepository.save(settings);
            }
            
            return settings;
        } catch (Exception e) {
            logger.error("❌ Error fetching platform settings: {}", e.getMessage());
            // Return default settings if database error
            return new PlatformSettings();
        }
    }

    /**
     * Update platform settings
     */
    public PlatformSettings updateSettings(PlatformSettings newSettings, String updatedBy) {
        try {
            PlatformSettings existing = settingsRepository.findFirstByOrderByUpdatedAtDesc();
            
            if (existing == null) {
                existing = new PlatformSettings();
            }

            // Update fields
            if (newSettings.getAiEnabled() != null) {
                existing.setAiEnabled(newSettings.getAiEnabled());
            }
            if (newSettings.getEmailNotifications() != null) {
                existing.setEmailNotifications(newSettings.getEmailNotifications());
            }
            if (newSettings.getRegistrationEnabled() != null) {
                existing.setRegistrationEnabled(newSettings.getRegistrationEnabled());
            }
            if (newSettings.getGamificationEnabled() != null) {
                existing.setGamificationEnabled(newSettings.getGamificationEnabled());
            }

            // Update metadata
            existing.setUpdatedAt(LocalDateTime.now());
            existing.setUpdatedBy(updatedBy);

            PlatformSettings saved = settingsRepository.save(existing);
            logger.info("✅ Platform settings updated by: {}", updatedBy);
            
            return saved;
        } catch (Exception e) {
            logger.error("❌ Error updating platform settings: {}", e.getMessage());
            throw new RuntimeException("Failed to update platform settings", e);
        }
    }

    /**
     * Check if a specific feature is enabled
     */
    public boolean isFeatureEnabled(String featureName) {
        try {
            PlatformSettings settings = getSettings();
            
            switch (featureName.toLowerCase()) {
                case "ai":
                case "ai_enabled":
                    return settings.getAiEnabled() != null && settings.getAiEnabled();
                case "email":
                case "email_notifications":
                    return settings.getEmailNotifications() != null && settings.getEmailNotifications();
                case "registration":
                case "registration_enabled":
                    return settings.getRegistrationEnabled() != null && settings.getRegistrationEnabled();
                case "gamification":
                case "gamification_enabled":
                    return settings.getGamificationEnabled() != null && settings.getGamificationEnabled();
                default:
                    logger.warn("⚠️ Unknown feature name: {}", featureName);
                    return false;
            }
        } catch (Exception e) {
            logger.error("❌ Error checking feature status: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get settings summary for dashboard
     */
    public Map<String, Object> getSettingsSummary() {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            PlatformSettings settings = getSettings();
            
            summary.put("aiEnabled", settings.getAiEnabled());
            summary.put("emailNotifications", settings.getEmailNotifications());
            summary.put("registrationEnabled", settings.getRegistrationEnabled());
            summary.put("gamificationEnabled", settings.getGamificationEnabled());
            summary.put("lastUpdated", settings.getUpdatedAt());
            summary.put("updatedBy", settings.getUpdatedBy());
            summary.put("version", settings.getVersion());
            
            // Feature counts
            int enabledCount = 0;
            if (Boolean.TRUE.equals(settings.getAiEnabled())) enabledCount++;
            if (Boolean.TRUE.equals(settings.getEmailNotifications())) enabledCount++;
            if (Boolean.TRUE.equals(settings.getRegistrationEnabled())) enabledCount++;
            if (Boolean.TRUE.equals(settings.getGamificationEnabled())) enabledCount++;
            
            summary.put("featuresEnabled", enabledCount);
            summary.put("totalFeatures", 4);
            
        } catch (Exception e) {
            logger.error("❌ Error generating settings summary: {}", e.getMessage());
            summary.put("error", e.getMessage());
        }
        
        return summary;
    }
}
