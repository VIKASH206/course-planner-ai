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

@RestController
@RequestMapping("/api/admin/course-content")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class CourseContentController {
    
    private static final Logger logger = LoggerFactory.getLogger(CourseContentController.class);
    
    @Autowired
    private CourseContentService contentService;
    
    /**
     * GET /api/admin/course-content/{courseId}
     * Get course content by course ID
     */
    @GetMapping("/{courseId}")
    public ResponseEntity<ApiResponse<CourseContent>> getContent(@PathVariable String courseId) {
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
                    ApiResponse.success("No content found, returning empty structure", emptyContent)
                );
            }
        } catch (Exception e) {
            logger.error("Error retrieving course content: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve course content: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/admin/course-content
     * Create or update course content
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CourseContent>> saveContent(@RequestBody CourseContent content) {
        try {
            CourseContent savedContent = contentService.saveCourseContent(content);
            return ResponseEntity.ok(
                ApiResponse.success("Course content saved successfully", savedContent)
            );
        } catch (Exception e) {
            logger.error("Error saving course content: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to save course content: " + e.getMessage()));
        }
    }
    
    /**
     * DELETE /api/admin/course-content/{courseId}
     * Delete course content
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable String courseId) {
        try {
            contentService.deleteContent(courseId);
            return ResponseEntity.ok(
                ApiResponse.success("Course content deleted successfully", null)
            );
        } catch (Exception e) {
            logger.error("Error deleting course content: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to delete course content: " + e.getMessage()));
        }
    }
}
