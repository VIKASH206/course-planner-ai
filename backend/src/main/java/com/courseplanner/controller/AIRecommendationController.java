package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.Course;
import com.courseplanner.service.CourseService;
import com.courseplanner.service.AIRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AIRecommendationController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private AIRecommendationService aiRecommendationService;

    /**
     * Generate personalized onboarding recommendations
     * POST /api/ai/onboarding-recommendations
     * 
     * STRICT RULES:
     * - Priority to user's selected Interests
     * - Align with user's Goals
     * - STRICTLY filter by Experience Level (no mixing of difficulty levels)
     * - Show "Coming Soon" if no courses available
     */
    @PostMapping("/onboarding-recommendations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateOnboardingRecommendations(
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User ID is required"));
            }
            
            // Generate personalized onboarding recommendations
            Map<String, Object> recommendations = aiRecommendationService.generateOnboardingRecommendations(userId);
            
            if (!(Boolean) recommendations.get("success")) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error((String) recommendations.get("message")));
            }
            
            return ResponseEntity.ok(
                ApiResponse.success("Personalized recommendations generated successfully", recommendations)
            );
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate recommendations: " + e.getMessage()));
        }
    }

    /**
     * Get AI-based personalized course recommendations
     * Based on user interests, learning history, and skill level
     */
    @PostMapping("/recommend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecommendations(
            @RequestBody Map<String, Object> userProfile) {
        try {
            String userId = (String) userProfile.get("userId");
            @SuppressWarnings("unchecked")
            List<String> interests = (List<String>) userProfile.getOrDefault("interests", new ArrayList<>());
            String skillLevel = (String) userProfile.getOrDefault("skillLevel", "beginner");
            @SuppressWarnings("unchecked")
            List<String> completedCourses = (List<String>) userProfile.getOrDefault("completedCourses", new ArrayList<>());
            
            // Get all courses
            List<Course> allCourses = courseService.getAllCourses();
            
            // AI Recommendation Logic
            List<Map<String, Object>> recommendedCourses = allCourses.stream()
                .filter(course -> {
                    // Filter out completed courses
                    if (completedCourses.contains(course.getId())) {
                        return false;
                    }
                    
                    // Match skill level
                    if (course.getDifficulty() != null) {
                        String courseDifficulty = course.getDifficulty().toLowerCase();
                        String userLevel = skillLevel.toLowerCase();
                        
                        if (userLevel.equals("beginner") && !courseDifficulty.equals("beginner")) {
                            return false;
                        }
                        if (userLevel.equals("intermediate") && courseDifficulty.equals("advanced")) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .map(course -> {
                    // Calculate relevance score based on user interests
                    int relevanceScore = 0;
                    
                    if (course.getTags() != null) {
                        for (String interest : interests) {
                            if (course.getTags().stream()
                                .anyMatch(tag -> tag.toLowerCase().contains(interest.toLowerCase()))) {
                                relevanceScore += 10;
                            }
                        }
                    }
                    
                    if (course.getCategory() != null) {
                        for (String interest : interests) {
                            if (course.getCategory().toLowerCase().contains(interest.toLowerCase())) {
                                relevanceScore += 15;
                            }
                        }
                    }
                    
                    // Add base score for all courses
                    relevanceScore += 5;
                    
                    // Create course with AI metadata
                    Map<String, Object> courseWithScore = new HashMap<>();
                    courseWithScore.put("course", course);
                    courseWithScore.put("relevanceScore", relevanceScore);
                    courseWithScore.put("aiSuggested", true);
                    courseWithScore.put("reason", generateRecommendationReason(course, interests, skillLevel));
                    
                    return courseWithScore;
                })
                .sorted((a, b) -> Integer.compare(
                    (Integer) b.get("relevanceScore"), 
                    (Integer) a.get("relevanceScore")))
                .limit(6) // Top 6 recommendations
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("recommendations", recommendedCourses);
            response.put("userId", userId);
            response.put("totalRecommendations", recommendedCourses.size());
            response.put("basedOn", Map.of(
                "interests", interests,
                "skillLevel", skillLevel,
                "completedCoursesCount", completedCourses.size()
            ));
            
            return ResponseEntity.ok(ApiResponse.success("AI recommendations generated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate recommendations: " + e.getMessage()));
        }
    }
    
    /**
     * Get AI summary of a course
     */
    @GetMapping("/summarize/{courseId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> summarizeCourse(
            @PathVariable String courseId) {
        try {
            Course course = courseService.getCourseById(courseId);
            
            // Generate AI summary
            String summary = generateCourseSummary(course);
            String[] keyPoints = generateKeyPoints(course);
            String[] learningOutcomes = generateLearningOutcomes(course);
            int estimatedCompletionDays = (int) Math.ceil(course.getEstimatedHours() / 2.0); // 2 hours per day
            
            Map<String, Object> aiSummary = new HashMap<>();
            aiSummary.put("courseId", courseId);
            aiSummary.put("summary", summary);
            aiSummary.put("keyPoints", keyPoints);
            aiSummary.put("learningOutcomes", learningOutcomes);
            aiSummary.put("estimatedCompletionDays", estimatedCompletionDays);
            aiSummary.put("difficulty", course.getDifficulty());
            aiSummary.put("recommendedFor", generateRecommendedFor(course));
            
            return ResponseEntity.ok(ApiResponse.success("Course summary generated successfully", aiSummary));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate summary: " + e.getMessage()));
        }
    }
    
    /**
     * Get related courses based on a course
     */
    @GetMapping("/related/{courseId}")
    public ResponseEntity<ApiResponse<List<Course>>> getRelatedCourses(
            @PathVariable String courseId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            Course sourceCourse = courseService.getCourseById(courseId);
            List<Course> allCourses = courseService.getAllCourses();
            
            List<Course> relatedCourses = allCourses.stream()
                .filter(course -> !course.getId().equals(courseId))
                .filter(course -> {
                    // Match by category
                    if (sourceCourse.getCategory() != null && 
                        sourceCourse.getCategory().equals(course.getCategory())) {
                        return true;
                    }
                    
                    // Match by tags
                    if (sourceCourse.getTags() != null && course.getTags() != null) {
                        return sourceCourse.getTags().stream()
                            .anyMatch(tag -> course.getTags().contains(tag));
                    }
                    
                    return false;
                })
                .limit(limit)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Related courses found", relatedCourses));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to find related courses: " + e.getMessage()));
        }
    }
    
    // Helper methods
    
    private String generateRecommendationReason(Course course, List<String> interests, String skillLevel) {
        List<String> reasons = new ArrayList<>();
        
        if (course.getDifficulty() != null && 
            course.getDifficulty().equalsIgnoreCase(skillLevel)) {
            reasons.add("Matches your " + skillLevel + " skill level");
        }
        
        if (course.getTags() != null) {
            for (String interest : interests) {
                if (course.getTags().stream()
                    .anyMatch(tag -> tag.toLowerCase().contains(interest.toLowerCase()))) {
                    reasons.add("Aligns with your interest in " + interest);
                    break;
                }
            }
        }
        
        if (reasons.isEmpty()) {
            reasons.add("Popular course in " + course.getCategory());
        }
        
        return String.join(". ", reasons);
    }
    
    private String generateCourseSummary(Course course) {
        return String.format(
            "%s is a %s-level course that covers %s. " +
            "This course is designed to help you master key concepts in %s through practical examples and hands-on projects.",
            course.getTitle(),
            course.getDifficulty() != null ? course.getDifficulty().toLowerCase() : "comprehensive",
            course.getDescription() != null ? course.getDescription().toLowerCase() : "essential topics",
            course.getCategory() != null ? course.getCategory() : "the subject area"
        );
    }
    
    private String[] generateKeyPoints(Course course) {
        List<String> keyPoints = new ArrayList<>();
        keyPoints.add("Comprehensive coverage of " + (course.getCategory() != null ? course.getCategory() : "core concepts"));
        keyPoints.add("Hands-on practical exercises and projects");
        keyPoints.add("Suitable for " + (course.getDifficulty() != null ? course.getDifficulty().toLowerCase() : "all") + " learners");
        keyPoints.add("Estimated " + course.getEstimatedHours() + " hours of learning content");
        
        if (course.getTags() != null && !course.getTags().isEmpty()) {
            keyPoints.add("Covers: " + String.join(", ", course.getTags().subList(0, Math.min(3, course.getTags().size()))));
        }
        
        return keyPoints.toArray(new String[0]);
    }
    
    private String[] generateLearningOutcomes(Course course) {
        List<String> outcomes = new ArrayList<>();
        outcomes.add("Master fundamental concepts of " + (course.getCategory() != null ? course.getCategory() : "the subject"));
        outcomes.add("Apply knowledge through practical projects");
        outcomes.add("Build real-world applications");
        outcomes.add("Develop problem-solving skills");
        outcomes.add("Gain confidence in " + (course.getCategory() != null ? course.getCategory() : "your skills"));
        
        return outcomes.toArray(new String[0]);
    }
    
    private String[] generateRecommendedFor(Course course) {
        List<String> recommendedFor = new ArrayList<>();
        
        String difficulty = course.getDifficulty() != null ? course.getDifficulty().toLowerCase() : "beginner";
        
        switch (difficulty) {
            case "beginner":
                recommendedFor.add("Complete beginners with no prior experience");
                recommendedFor.add("Students looking to start their journey in " + course.getCategory());
                recommendedFor.add("Professionals switching careers");
                break;
            case "intermediate":
                recommendedFor.add("Learners with basic understanding");
                recommendedFor.add("Professionals looking to enhance their skills");
                recommendedFor.add("Students preparing for advanced topics");
                break;
            case "advanced":
                recommendedFor.add("Experienced professionals");
                recommendedFor.add("Senior developers/engineers");
                recommendedFor.add("Those seeking mastery in " + course.getCategory());
                break;
            default:
                recommendedFor.add("All learners interested in " + course.getCategory());
        }
        
        return recommendedFor.toArray(new String[0]);
    }
}
