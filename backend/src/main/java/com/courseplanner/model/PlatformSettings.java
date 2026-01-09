package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Platform-wide settings for admin control
 */
@Document(collection = "platform_settings")
public class PlatformSettings {
    @Id
    private String id;
    
    // Settings
    private Boolean aiEnabled;
    private Boolean emailNotifications;
    private Boolean registrationEnabled;
    private Boolean gamificationEnabled;
    
    // Metadata
    private LocalDateTime updatedAt;
    private String updatedBy;
    private String version = "1.0";
    
    // Default constructor
    public PlatformSettings() {
        this.aiEnabled = true;
        this.emailNotifications = true;
        this.registrationEnabled = true;
        this.gamificationEnabled = true;
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Boolean getAiEnabled() {
        return aiEnabled;
    }

    public void setAiEnabled(Boolean aiEnabled) {
        this.aiEnabled = aiEnabled;
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public Boolean getRegistrationEnabled() {
        return registrationEnabled;
    }

    public void setRegistrationEnabled(Boolean registrationEnabled) {
        this.registrationEnabled = registrationEnabled;
    }

    public Boolean getGamificationEnabled() {
        return gamificationEnabled;
    }

    public void setGamificationEnabled(Boolean gamificationEnabled) {
        this.gamificationEnabled = gamificationEnabled;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
