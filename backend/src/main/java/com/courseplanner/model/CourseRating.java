package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

/**
 * Represents a course rating given by a user
 */
@Document(collection = "course_ratings")
@CompoundIndex(def = "{'userId': 1, 'courseId': 1}", unique = true)
public class CourseRating {
    @Id
    private String id;
    
    @Indexed
    private String courseId;
    
    @Indexed
    private String userId;
    
    private double rating; // 1.0 - 5.0
    
    private String review;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    // Default constructor
    public CourseRating() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor
    public CourseRating(String courseId, String userId, double rating) {
        this();
        this.courseId = courseId;
        this.userId = userId;
        this.rating = rating;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
        this.updatedAt = LocalDateTime.now();
    }

    public String getReview() {
        return review;
    }

    public void setReview(String review) {
        this.review = review;
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
}
