package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.dto.ChatRequest;
import com.courseplanner.dto.QuizRequest;
import com.courseplanner.model.Course;
import com.courseplanner.model.Task;
import com.courseplanner.service.CourseService;
import com.courseplanner.service.GeminiService;
import com.courseplanner.service.TaskService;
import com.courseplanner.service.AIRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private AIRecommendationService aiRecommendationService;

    /**
     * Generate study path suggestions for user's courses
     */
    @GetMapping("/study-path/{userId}")
    public ResponseEntity<ApiResponse<String>> generateStudyPath(@PathVariable String userId) {
        try {
            List<Course> userCourses = courseService.getUserCourses(userId);
            
            if (userCourses.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No courses found for user"));
            }

            String studyPath = geminiService.generateStudyPath(userCourses);
            return ResponseEntity.ok(ApiResponse.success("Study path generated successfully", studyPath));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate study path: " + e.getMessage()));
        }
    }

    /**
     * Summarize content or course notes
     */
    @PostMapping("/summarize")
    public ResponseEntity<ApiResponse<String>> summarizeContent(@RequestBody Map<String, String> request) {
        try {
            String content = request.get("content");
            
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Content is required for summarization"));
            }

            String summary = geminiService.summarizeContent(content);
            return ResponseEntity.ok(ApiResponse.success("Content summarized successfully", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to summarize content: " + e.getMessage()));
        }
    }

    /**
     * Generate quiz questions from content
     */
    @PostMapping("/quiz")
    public ResponseEntity<ApiResponse<String>> generateQuiz(@RequestBody QuizRequest request) {
        try {
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Content is required for quiz generation"));
            }

            int numberOfQuestions = request.getNumberOfQuestions() > 0 ? request.getNumberOfQuestions() : 5;
            String quiz = geminiService.generateQuiz(request.getContent(), numberOfQuestions);
            return ResponseEntity.ok(ApiResponse.success("Quiz generated successfully", quiz));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate quiz: " + e.getMessage()));
        }
    }

    /**
     * Generate smart reminders based on user's task patterns
     */
    @GetMapping("/smart-reminders/{userId}")
    public ResponseEntity<ApiResponse<String>> generateSmartReminders(@PathVariable String userId) {
        try {
            // Get recent completed tasks (last 10)
            List<Task> recentTasks = taskService.getTasksByStatus(userId, "completed")
                    .stream()
                    .limit(10)
                    .toList();

            // Get upcoming tasks
            List<Task> upcomingTasks = taskService.getUpcomingTasks(userId);

            if (recentTasks.isEmpty() && upcomingTasks.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No task data available for analysis"));
            }

            String reminders = geminiService.generateSmartReminders(recentTasks, upcomingTasks);
            return ResponseEntity.ok(ApiResponse.success("Smart reminders generated successfully", reminders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate smart reminders: " + e.getMessage()));
        }
    }

    /**
     * AI Chat for study guidance and FAQs with question classification
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> aiChat(@RequestBody ChatRequest request) {
        try {
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Message is required for chat"));
            }

            // Check if this is a course recommendation request
            String message = request.getMessage().toLowerCase();
            boolean isRecommendationRequest = message.contains("recommend") || 
                                             message.contains("suggest") || 
                                             message.contains("course for me") ||
                                             message.contains("what should i learn");

            String response;
            
            if (isRecommendationRequest && request.getUserId() != null) {
                // Generate personalized recommendations based on user interests
                response = geminiService.generatePersonalizedCourseRecommendation(
                    request.getUserId(), 
                    request.getMessage()
                );
            } else {
                // Regular chat response
                response = geminiService.chatResponse(request.getMessage(), request.getContext());
            }
            
            // Determine if this was classified as project-related or not
            boolean isProjectRelated = !response.contains("Meet Admin");
            
            Map<String, Object> chatResponse = new HashMap<>();
            chatResponse.put("message", response);
            chatResponse.put("isProjectRelated", isProjectRelated);
            chatResponse.put("showMeetAdmin", !isProjectRelated);
            chatResponse.put("timestamp", new Date());
            
            return ResponseEntity.ok(ApiResponse.success("Chat response generated successfully", chatResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate chat response: " + e.getMessage()));
        }
    }

    /**
     * AI Chat specific to a course
     */
    @PostMapping("/chat/course/{courseId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> courseChatAI(
            @PathVariable String courseId,
            @RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String userId = request.get("userId");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Message is required for chat"));
            }

            // Get course context if available
            String courseContext = "Course ID: " + courseId;
            try {
                Course course = courseService.getCourseById(courseId);
                if (course != null) {
                    courseContext = "You are helping with the course: " + course.getTitle() + 
                                  ". Course description: " + course.getDescription();
                }
            } catch (Exception e) {
                // Course not found, use basic context
            }

            String aiResponse = geminiService.chatResponse(message, courseContext);
            
            Map<String, Object> chatResponse = new HashMap<>();
            chatResponse.put("id", "ai-" + System.currentTimeMillis());
            chatResponse.put("message", message);
            chatResponse.put("response", aiResponse);
            chatResponse.put("timestamp", new Date());
            chatResponse.put("isFromUser", false);
            chatResponse.put("courseId", courseId);
            
            return ResponseEntity.ok(ApiResponse.success("Chat response generated successfully", chatResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate chat response: " + e.getMessage()));
        }
    }

    /**
     * Generate study tips based on weak/strong areas
     */
    @PostMapping("/study-tips")
    public ResponseEntity<ApiResponse<String>> generateStudyTips(@RequestBody Map<String, String> request) {
        try {
            String weakAreas = request.get("weakAreas");
            String strongAreas = request.get("strongAreas");

            if (weakAreas == null || weakAreas.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Weak areas information is required"));
            }

            String studyTips = geminiService.generateStudyTips(weakAreas, strongAreas);
            return ResponseEntity.ok(ApiResponse.success("Study tips generated successfully", studyTips));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate study tips: " + e.getMessage()));
        }
    }

    /**
     * Analyze progress and provide insights
     */
    @PostMapping("/analyze-progress")
    public ResponseEntity<ApiResponse<String>> analyzeProgress(@RequestBody Map<String, String> request) {
        try {
            String progressData = request.get("progressData");

            if (progressData == null || progressData.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Progress data is required for analysis"));
            }

            String analysis = geminiService.analyzeProgress(progressData);
            return ResponseEntity.ok(ApiResponse.success("Progress analysis completed successfully", analysis));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to analyze progress: " + e.getMessage()));
        }
    }

    /**
     * Get AI suggestions for course difficulty ordering
     */
    @GetMapping("/course-difficulty/{userId}")
    public ResponseEntity<ApiResponse<String>> suggestCourseDifficulty(@PathVariable String userId) {
        try {
            List<Course> userCourses = courseService.getUserCourses(userId);
            
            if (userCourses.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No courses found for user"));
            }

            // Create a summary of courses for AI analysis
            StringBuilder courseSummary = new StringBuilder();
            courseSummary.append("Analyze the following courses and suggest optimal difficulty progression:\n");
            for (Course course : userCourses) {
                courseSummary.append("- ").append(course.getTitle())
                           .append(" (Current difficulty: ").append(course.getDifficulty())
                           .append(", Progress: ").append(course.getProgressPercentage()).append("%)\n");
            }
            courseSummary.append("\nProvide recommendations for difficulty adjustment and learning sequence.");

            String suggestions = geminiService.generateCustomResponse(courseSummary.toString());
            return ResponseEntity.ok(ApiResponse.success("Course difficulty suggestions generated", suggestions));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to generate course suggestions: " + e.getMessage()));
        }
    }

    /**
     * GET /api/ai/recommendations/{userId} - Get personalized AI recommendations
     * Returns top 6 recommended courses based on user's learning profile
     */
    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecommendations(
            @PathVariable String userId) {
        try {
            List<Map<String, Object>> recommendations = 
                    aiRecommendationService.getPersonalizedRecommendations(userId);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "AI recommendations generated successfully", recommendations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate recommendations: " + e.getMessage()));
        }
    }

    /**
     * POST /api/ai/recommendations - Get recommendations with user profile
     * Request body: { 
     *   "userId": "...", 
     *   "interests": ["AI", "Python"], 
     *   "skillLevel": "intermediate",
     *   "completedCourses": ["course1", "course2"]
     * }
     */
    @PostMapping("/recommendations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecommendationsWithProfile(
            @RequestBody Map<String, Object> userProfile) {
        try {
            String userId = (String) userProfile.get("userId");
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId is required"));
            }
            
            List<Map<String, Object>> recommendations = 
                    aiRecommendationService.getPersonalizedRecommendations(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("recommendations", recommendations);
            response.put("userId", userId);
            response.put("timestamp", System.currentTimeMillis());
            response.put("count", recommendations.size());
            
            return ResponseEntity.ok(ApiResponse.success(
                    "AI recommendations generated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate recommendations: " + e.getMessage()));
        }
    }

    /**
     * GET /api/ai/recommendations/enhanced/{userId} - Get AI-enhanced recommendations
     * Uses advanced AI logic with Gemini integration
     */
    @GetMapping("/recommendations/enhanced/{userId}")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEnhancedRecommendations(
            @PathVariable String userId) {
        try {
            List<Map<String, Object>> recommendations = 
                    aiRecommendationService.getAIEnhancedRecommendations(userId);
            
            return ResponseEntity.ok(ApiResponse.success(
                    "Enhanced AI recommendations generated successfully", recommendations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate enhanced recommendations: " + e.getMessage()));
        }
    }

    /**
     * GET /api/ai/health - Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "AI Recommendation Service");
        health.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(ApiResponse.success("AI service is running", health));
    }
}