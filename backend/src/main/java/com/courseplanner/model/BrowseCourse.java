package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Enhanced Course model for Browse Courses functionality
 * Separate from user-specific Course model to represent the course catalog
 */
@Document(collection = "browse_courses")
public class BrowseCourse {
    @Id
    private String id;
    
    @Indexed
    private String title;
    
    private String description;
    
    @Indexed
    private String category;
    
    @Indexed
    private String difficulty; // Beginner, Intermediate, Advanced, Expert
    
    private String instructor;
    
    private String imageUrl;
    
    private int duration; // in hours
    
    private int estimatedTime; // in hours (alias for duration)
    
    private List<String> tags;
    
    private double rating; // 0.0 - 5.0
    
    private int studentsCount;
    
    private double popularityScore; // Calculated based on enrollments, ratings, etc.
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @Indexed
    private boolean isPublished; // Only published courses shown in browse
    
    private boolean isFeatured;
    
    private boolean isTrending;
    
    private boolean isNew; // Mark as new course
    
    private boolean isComingSoon; // Mark as coming soon
    
    private LocalDateTime comingSoonDate; // Expected release date for coming soon courses
    
    private String courseRequestId; // Link to course request that generated this course
    
    private boolean trackInAI; // Whether to track in AI recommendation logs
    
    private double price; // Course price
    
    private String syllabusUrl;
    
    private List<String> prerequisites;
    
    private List<String> learningOutcomes;
    
    private String level; // Alias for difficulty

    // Default constructor
    public BrowseCourse() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.tags = new ArrayList<>();
        this.prerequisites = new ArrayList<>();
        this.learningOutcomes = new ArrayList<>();
        this.rating = 0.0;
        this.studentsCount = 0;
        this.popularityScore = 0.0;
        this.isPublished = true;
        this.isFeatured = false;
        this.isTrending = false;
        this.isNew = false;
        this.isComingSoon = false;
        this.trackInAI = true; // Default: track all courses
        this.price = 0.0;
    }

    // Constructor with basic fields
    public BrowseCourse(String title, String description, String category, String difficulty, String instructor) {
        this();
        this.title = title;
        this.description = description;
        this.category = category;
        this.difficulty = difficulty;
        this.level = difficulty;
        this.instructor = instructor;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
        this.level = difficulty; // Keep in sync
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
        this.estimatedTime = duration; // Keep in sync
    }

    public int getEstimatedTime() {
        return estimatedTime;
    }

    public void setEstimatedTime(int estimatedTime) {
        this.estimatedTime = estimatedTime;
        this.duration = estimatedTime; // Keep in sync
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getStudentsCount() {
        return studentsCount;
    }

    public void setStudentsCount(int studentsCount) {
        this.studentsCount = studentsCount;
    }

    public double getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(double popularityScore) {
        this.popularityScore = popularityScore;
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

    public boolean isPublished() {
        return isPublished;
    }

    public void setPublished(boolean published) {
        isPublished = published;
    }

    public boolean isFeatured() {
        return isFeatured;
    }

    public void setFeatured(boolean featured) {
        isFeatured = featured;
    }

    public boolean isTrending() {
        return isTrending;
    }

    public void setTrending(boolean trending) {
        isTrending = trending;
    }

    public String getSyllabusUrl() {
        return syllabusUrl;
    }

    public void setSyllabusUrl(String syllabusUrl) {
        this.syllabusUrl = syllabusUrl;
    }

    public List<String> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public List<String> getLearningOutcomes() {
        return learningOutcomes;
    }

    public void setLearningOutcomes(List<String> learningOutcomes) {
        this.learningOutcomes = learningOutcomes;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
        this.difficulty = level; // Keep in sync
    }

    // Helper method to calculate popularity score
    public void calculatePopularityScore() {
        // Formula: (studentsCount * 0.5) + (rating * 20) + (trending ? 50 : 0) + (featured ? 30 : 0)
        this.popularityScore = (studentsCount * 0.5) + (rating * 20) + 
                              (isTrending ? 50 : 0) + (isFeatured ? 30 : 0);
    }

    // Helper method to increment student count
    public void incrementStudentCount() {
        this.studentsCount++;
        calculatePopularityScore();
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isNew() {
        return isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }

    public boolean isComingSoon() {
        return isComingSoon;
    }

    public void setComingSoon(boolean comingSoon) {
        isComingSoon = comingSoon;
    }

    public LocalDateTime getComingSoonDate() {
        return comingSoonDate;
    }

    public void setComingSoonDate(LocalDateTime comingSoonDate) {
        this.comingSoonDate = comingSoonDate;
    }

    public String getCourseRequestId() {
        return courseRequestId;
    }

    public void setCourseRequestId(String courseRequestId) {
        this.courseRequestId = courseRequestId;
    }

    public boolean isTrackInAI() {
        return trackInAI;
    }

    public void setTrackInAI(boolean trackInAI) {
        this.trackInAI = trackInAI;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
