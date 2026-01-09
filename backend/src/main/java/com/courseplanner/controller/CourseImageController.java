package com.courseplanner.controller;

import com.courseplanner.service.PixabayService;
import com.courseplanner.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for course image operations using Pixabay API
 */
@RestController
@RequestMapping("/course-images")
public class CourseImageController {

    @Autowired
    private PixabayService pixabayService;

    /**
     * GET /api/course-images?courseName=Python Programming
     * 
     * Fetch an image from Pixabay based on course name
     * 
     * @param courseName The name of the course
     * @return JSON containing courseName and imageUrl
     * 
     * Example Response:
     * {
     *   "success": true,
     *   "message": "Image fetched successfully",
     *   "data": {
     *     "courseName": "Python Programming",
     *     "imageUrl": "https://pixabay.com/get/...",
     *     "status": "success",
     *     "imageId": "12345",
     *     "tags": "python, programming, code",
     *     "user": "pixabay_user"
     *   }
     * }
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getCourseImage(
            @RequestParam String courseName) {
        
        System.out.println("📸 Fetching image for course: " + courseName);
        
        Map<String, String> imageData = pixabayService.getCourseImage(courseName);
        
        return ResponseEntity.ok(
            ApiResponse.success("Image fetched successfully", imageData)
        );
    }

    /**
     * POST /api/course-images/batch
     * 
     * Fetch images for multiple courses in one request
     * 
     * @param request Object containing list of course names
     * @return JSON containing array of course images
     * 
     * Example Request:
     * {
     *   "courseNames": ["Python Programming", "Web Development", "Data Science"]
     * }
     * 
     * Example Response:
     * {
     *   "success": true,
     *   "message": "Images fetched successfully",
     *   "data": [
     *     {
     *       "courseName": "Python Programming",
     *       "imageUrl": "https://...",
     *       "status": "success"
     *     },
     *     ...
     *   ]
     * }
     */
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getCourseImagesBatch(
            @RequestBody BatchImageRequest request) {
        
        System.out.println("📸 Fetching images for " + request.getCourseNames().size() + " courses");
        
        List<Map<String, String>> imagesData = pixabayService.getCourseImages(request.getCourseNames());
        
        return ResponseEntity.ok(
            ApiResponse.success("Images fetched successfully", imagesData)
        );
    }

    /**
     * Request DTO for batch image fetching
     */
    public static class BatchImageRequest {
        private List<String> courseNames;

        public List<String> getCourseNames() {
            return courseNames;
        }

        public void setCourseNames(List<String> courseNames) {
            this.courseNames = courseNames;
        }
    }
}
