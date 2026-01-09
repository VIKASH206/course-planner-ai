package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

/**
 * Represents a user's enrollment in a course
 * Links users to browse courses they've enrolled in
 */
@Document(collection = "enrollments")
@CompoundIndex(def = "{'userId': 1, 'courseId': 1}", unique = true)
public class UserCourseEnrollment {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private String courseId; // Reference to BrowseCourse
    
    private int progress; // 0-100
    
    private LocalDateTime enrolledAt;
    
    private LocalDateTime lastAccessedAt;
    
    private LocalDateTime completedAt;
    
    private boolean isCompleted;
    
    private boolean isActive;
    
    private String currentModuleId;
    
    private String currentTopicId;

    // Default constructor
    public UserCourseEnrollment() {
        this.enrolledAt = LocalDateTime.now();
        this.lastAccessedAt = LocalDateTime.now();
        this.progress = 0;
        this.isCompleted = false;
        this.isActive = true;
    }

    // Constructor
    public UserCourseEnrollment(String userId, String courseId) {
        this();
        this.userId = userId;
        this.courseId = courseId;
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

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
        if (progress >= 100 && !this.isCompleted) {
            this.isCompleted = true;
            this.completedAt = LocalDateTime.now();
        }
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
        if (completed && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
            this.progress = 100;
        }
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getCurrentModuleId() {
        return currentModuleId;
    }

    public void setCurrentModuleId(String currentModuleId) {
        this.currentModuleId = currentModuleId;
    }

    public String getCurrentTopicId() {
        return currentTopicId;
    }

    public void setCurrentTopicId(String currentTopicId) {
        this.currentTopicId = currentTopicId;
    }
}
