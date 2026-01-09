package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.CourseContent;
import com.courseplanner.service.CourseContentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Public API for students to access course content
 */
@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class PublicCourseContentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PublicCourseContentController.class);
    
    @Autowired
    private CourseContentService contentService;
    
    /**
     * GET /api/courses/{courseId}/content
     * Get course content by course ID (public endpoint for enrolled students)
     */
    @GetMapping("/{courseId}/content")
    public ResponseEntity<ApiResponse<CourseContent>> getPublicContent(@PathVariable String courseId) {
        try {
            Optional<CourseContent> content = contentService.getContentByCourseId(courseId);
            
            if (content.isPresent()) {
                return ResponseEntity.ok(
                    ApiResponse.success("Course content retrieved successfully", content.get())
                );
            } else {
                // Return empty content structure
                CourseContent emptyContent = new CourseContent();
                emptyContent.setCourseId(courseId);
                return ResponseEntity.ok(
                    ApiResponse.success("No content available for this course", emptyContent)
                );
            }
        } catch (Exception e) {
            logger.error("Error retrieving course content: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve course content: " + e.getMessage()));
        }
    }
}
