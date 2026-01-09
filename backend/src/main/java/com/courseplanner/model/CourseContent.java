package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * CourseContent - Stores modules, videos, notes, and quizzes for a course
 * This is linked to BrowseCourse by courseId
 */
@Document(collection = "course_contents")
public class CourseContent {
    @Id
    private String id;
    
    private String courseId; // Reference to BrowseCourse
    
    private List<ContentModule> modules;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy; // Admin ID
    
    public CourseContent() {
        this.modules = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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
    
    public List<ContentModule> getModules() {
        return modules;
    }
    
    public void setModules(List<ContentModule> modules) {
        this.modules = modules;
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
    
    // Inner class for Module
    public static class ContentModule {
        private String id;
        private String title;
        private String description;
        private int orderIndex;
        private List<ContentLesson> lessons;
        
        public ContentModule() {
            this.lessons = new ArrayList<>();
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
        
        public int getOrderIndex() {
            return orderIndex;
        }
        
        public void setOrderIndex(int orderIndex) {
            this.orderIndex = orderIndex;
        }
        
        public List<ContentLesson> getLessons() {
            return lessons;
        }
        
        public void setLessons(List<ContentLesson> lessons) {
            this.lessons = lessons;
        }
    }
    
    // Inner class for Lesson
    public static class ContentLesson {
        private String id;
        private String title;
        private String type; // VIDEO, NOTE, QUIZ, READING
        private int orderIndex;
        
        // Video content
        private String videoUrl;
        private String videoThumbnail;
        private int videoDuration; // in seconds
        
        // Notes/Reading content
        private String textContent; // Markdown or HTML
        
        // Quiz content
        private String quizId; // Reference to Quiz collection
        
        // Resources
        private List<String> attachments; // URLs to PDFs, images, etc.
        private List<ExternalResource> externalLinks;
        
        public ContentLesson() {
            this.attachments = new ArrayList<>();
            this.externalLinks = new ArrayList<>();
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
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public int getOrderIndex() {
            return orderIndex;
        }
        
        public void setOrderIndex(int orderIndex) {
            this.orderIndex = orderIndex;
        }
        
        public String getVideoUrl() {
            return videoUrl;
        }
        
        public void setVideoUrl(String videoUrl) {
            this.videoUrl = videoUrl;
        }
        
        public String getVideoThumbnail() {
            return videoThumbnail;
        }
        
        public void setVideoThumbnail(String videoThumbnail) {
            this.videoThumbnail = videoThumbnail;
        }
        
        public int getVideoDuration() {
            return videoDuration;
        }
        
        public void setVideoDuration(int videoDuration) {
            this.videoDuration = videoDuration;
        }
        
        public String getTextContent() {
            return textContent;
        }
        
        public void setTextContent(String textContent) {
            this.textContent = textContent;
        }
        
        public String getQuizId() {
            return quizId;
        }
        
        public void setQuizId(String quizId) {
            this.quizId = quizId;
        }
        
        public List<String> getAttachments() {
            return attachments;
        }
        
        public void setAttachments(List<String> attachments) {
            this.attachments = attachments;
        }
        
        public List<ExternalResource> getExternalLinks() {
            return externalLinks;
        }
        
        public void setExternalLinks(List<ExternalResource> externalLinks) {
            this.externalLinks = externalLinks;
        }
    }
    
    // Inner class for External Resources
    public static class ExternalResource {
        private String title;
        private String url;
        private String description;
        
        public ExternalResource() {}
        
        // Getters and Setters
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
    }
}
