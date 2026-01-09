package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "course_requests")
public class CourseRequest {
    @Id
    private String id;
    
    @Indexed
    private String interest; // Course interest/topic requested
    
    @Indexed
    private String level; // Beginner, Intermediate, Advanced
    
    private int requestedBy; // Number of users who requested this
    
    private LocalDateTime lastRequestedDate;
    
    @Indexed
    private String status; // Pending, Planned
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    // Default constructor
    public CourseRequest() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.requestedBy = 0;
        this.status = "Pending";
    }

    // Constructor
    public CourseRequest(String interest, String level) {
        this();
        this.interest = interest;
        this.level = level;
        this.lastRequestedDate = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInterest() {
        return interest;
    }

    public void setInterest(String interest) {
        this.interest = interest;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public int getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(int requestedBy) {
        this.requestedBy = requestedBy;
    }

    public LocalDateTime getLastRequestedDate() {
        return lastRequestedDate;
    }

    public void setLastRequestedDate(LocalDateTime lastRequestedDate) {
        this.lastRequestedDate = lastRequestedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
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

    // Helper method to increment request count
    public void incrementRequestCount() {
        this.requestedBy++;
        this.lastRequestedDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
