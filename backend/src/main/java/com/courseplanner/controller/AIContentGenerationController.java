package com.courseplanner.controller;

import com.courseplanner.service.AIContentGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for AI-powered course content generation
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AIContentGenerationController {

    @Autowired
    private AIContentGenerationService aiContentGenerationService;

    /**
     * Generate AI-powered course description
     * POST /api/ai/generate-description
     */
    @PostMapping("/generate-description")
    public ResponseEntity<Map<String, String>> generateDescription(
            @RequestBody Map<String, String> request) {
        
        String title = request.get("title");
        String category = request.get("category");
        
        if (title == null || title.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Title is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (category == null || category.trim().isEmpty()) {
            category = "Technology"; // Default category
        }
        
        String description = aiContentGenerationService.generateDescription(title, category);
        
        Map<String, String> response = new HashMap<>();
        response.put("description", description);
        response.put("title", title);
        response.put("category", category);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Generate AI-powered course tags
     * POST /api/ai/generate-tags
     */
    @PostMapping("/generate-tags")
    public ResponseEntity<Map<String, Object>> generateTags(
            @RequestBody Map<String, String> request) {
        
        String title = request.get("title");
        String category = request.get("category");
        
        if (title == null || title.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Title is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (category == null || category.trim().isEmpty()) {
            category = "Technology";
        }
        
        var tags = aiContentGenerationService.generateTags(title, category);
        
        Map<String, Object> response = new HashMap<>();
        response.put("tags", tags);
        response.put("title", title);
        response.put("category", category);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Generate AI-powered course image URL
     * POST /api/ai/generate-image
     */
    @PostMapping("/generate-image")
    public ResponseEntity<Map<String, String>> generateImage(
            @RequestBody Map<String, String> request) {
        
        String category = request.get("category");
        
        if (category == null || category.trim().isEmpty()) {
            category = "Technology";
        }
        
        String imageUrl = aiContentGenerationService.generateImageUrl(category);
        String emoji = aiContentGenerationService.generateEmoji(category);
        
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", imageUrl);
        response.put("emoji", emoji);
        response.put("category", category);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Complete AI enhancement - generates description, tags, and image all at once
     * POST /api/ai/enhance-course
     */
    @PostMapping("/enhance-course")
    public ResponseEntity<Map<String, Object>> enhanceCourse(
            @RequestBody Map<String, String> request) {
        
        String title = request.get("title");
        String category = request.get("category");
        
        if (title == null || title.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Title is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        if (category == null || category.trim().isEmpty()) {
            category = "Technology";
        }
        
        Map<String, Object> enhancement = aiContentGenerationService.enhanceCourse(title, category);
        enhancement.put("title", title);
        enhancement.put("category", category);
        
        return ResponseEntity.ok(enhancement);
    }

    /**
     * Get available categories
     * GET /api/ai/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        Map<String, Object> response = new HashMap<>();
        response.put("categories", new String[]{
            "Programming",
            "Web Development",
            "Mobile Development",
            "Data Science",
            "Machine Learning",
            "AI",
            "Artificial Intelligence",
            "DevOps",
            "Cloud Computing",
            "Cybersecurity",
            "Design",
            "Business",
            "Database",
            "Networking",
            "Game Development",
            "Blockchain",
            "Technology"
        });
        return ResponseEntity.ok(response);
    }
}
