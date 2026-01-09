package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "activities")
public class Activity {
    @Id
    private String id;
    
    private String userId;           // User who performed the action
    private String username;         // Username for display
    private String userRole;         // "STUDENT" or "ADMIN"
    private String actionType;       // "COURSE_COMPLETED", "INTEREST_ADDED", "GOAL_SET", "ADMIN_MODIFIED_COURSE", etc.
    private String actionDescription; // Human-readable description
    private String targetType;       // "COURSE", "INTEREST", "GOAL", "USER", etc.
    private String targetId;         // ID of the affected entity
    private String targetName;       // Name for display
    private LocalDateTime timestamp;
    private boolean visibleToAdmin;  // Should admin see this?
    private boolean visibleToStudent; // Should students see this?
    
    public Activity() {
        this.timestamp = LocalDateTime.now();
        this.visibleToAdmin = true;
        this.visibleToStudent = false;
    }

    public Activity(String userId, String username, String userRole, String actionType, 
                   String actionDescription, String targetType, String targetId, String targetName) {
        this();
        this.userId = userId;
        this.username = username;
        this.userRole = userRole;
        this.actionType = actionType;
        this.actionDescription = actionDescription;
        this.targetType = targetType;
        this.targetId = targetId;
        this.targetName = targetName;
        
        // Set visibility based on role
        if ("ADMIN".equals(userRole)) {
            this.visibleToAdmin = true;
            this.visibleToStudent = true; // Admin actions visible to students
        } else {
            this.visibleToAdmin = true; // Student actions visible to admin
            this.visibleToStudent = false;
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getActionDescription() {
        return actionDescription;
    }

    public void setActionDescription(String actionDescription) {
        this.actionDescription = actionDescription;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isVisibleToAdmin() {
        return visibleToAdmin;
    }

    public void setVisibleToAdmin(boolean visibleToAdmin) {
        this.visibleToAdmin = visibleToAdmin;
    }

    public boolean isVisibleToStudent() {
        return visibleToStudent;
    }

    public void setVisibleToStudent(boolean visibleToStudent) {
        this.visibleToStudent = visibleToStudent;
    }
}
