package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Module entity - represents a module/chapter within a course
 * Each module contains multiple topics and tracks completion
 */
@Document(collection = "modules")
public class Module {
    @Id
    private String id;
    
    // Core Information
    private String courseId;           // Reference to parent course
    private String title;              // Module title (e.g., "Introduction to Python")
    private String description;        // Detailed description
    private int orderIndex;            // Order in the course (1, 2, 3...)
    
    // Content
    private List<String> topicIds;     // References to topics in this module
    private String videoUrl;           // Optional introductory video
    private String thumbnailUrl;       // Module thumbnail
    
    // Progress Tracking
    private int durationMinutes;       // Estimated completion time
    private boolean isLocked;          // Whether module is locked (prerequisites not met)
    private List<String> prerequisites; // IDs of modules that must be completed first
    
    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;          // Instructor/Admin who created this
    
    // Learning Objectives
    private List<String> learningObjectives; // What students will learn
    private List<String> resources;          // Additional resources (links, PDFs, etc.)
    
    // Default constructor
    public Module() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.topicIds = new ArrayList<>();
        this.prerequisites = new ArrayList<>();
        this.learningObjectives = new ArrayList<>();
        this.resources = new ArrayList<>();
        this.isLocked = false;
        this.orderIndex = 1;
        this.durationMinutes = 0;
    }
    
    // Constructor with essential fields
    public Module(String courseId, String title, String description, int orderIndex) {
        this();
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.orderIndex = orderIndex;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getCourseId() {
        return courseId;
    }
    
    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public int getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }
    
    public List<String> getTopicIds() {
        return topicIds;
    }
    
    public void setTopicIds(List<String> topicIds) {
        this.topicIds = topicIds;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public String getThumbnailUrl() {
        return thumbnailUrl;
    }
    
    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
    
    public int getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public boolean isLocked() {
        return isLocked;
    }
    
    public void setLocked(boolean locked) {
        isLocked = locked;
    }
    
    public List<String> getPrerequisites() {
        return prerequisites;
    }
    
    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    public List<String> getLearningObjectives() {
        return learningObjectives;
    }
    
    public void setLearningObjectives(List<String> learningObjectives) {
        this.learningObjectives = learningObjectives;
    }
    
    public List<String> getResources() {
        return resources;
    }
    
    public void setResources(List<String> resources) {
        this.resources = resources;
    }
    
    @Override
    public String toString() {
        return "Module{" +
                "id='" + id + '\'' +
                ", courseId='" + courseId + '\'' +
                ", title='" + title + '\'' +
                ", orderIndex=" + orderIndex +
                ", topicCount=" + (topicIds != null ? topicIds.size() : 0) +
                ", isLocked=" + isLocked +
                '}';
    }
}
