package com.courseplanner.service;

import com.courseplanner.model.CourseContent;
import com.courseplanner.repository.CourseContentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CourseContentService {
    
    private static final Logger logger = LoggerFactory.getLogger(CourseContentService.class);
    
    @Autowired
    private CourseContentRepository courseContentRepository;
    
    /**
     * Get course content by course ID
     */
    public Optional<CourseContent> getContentByCourseId(String courseId) {
        return courseContentRepository.findByCourseId(courseId);
    }
    
    /**
     * Create or update course content
     */
    public CourseContent saveCourseContent(CourseContent content) {
        content.setUpdatedAt(LocalDateTime.now());
        return courseContentRepository.save(content);
    }
    
    /**
     * Check if content exists for a course
     */
    public boolean hasContent(String courseId) {
        return courseContentRepository.existsByCourseId(courseId);
    }
    
    /**
     * Delete course content
     */
    public void deleteContent(String courseId) {
        courseContentRepository.deleteByCourseId(courseId);
    }
    
    /**
     * Create empty content structure for a course
     */
    public CourseContent createEmptyContent(String courseId, String createdBy) {
        CourseContent content = new CourseContent();
        content.setCourseId(courseId);
        content.setCreatedBy(createdBy);
        return courseContentRepository.save(content);
    }
}
