package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.dto.LoginRequest;
import com.courseplanner.dto.SignupRequest;
import com.courseplanner.dto.OnboardingRequest;
import com.courseplanner.dto.AIAnalysisResponse;
import com.courseplanner.dto.PasswordChangeRequest;
import com.courseplanner.model.User;
import com.courseplanner.model.Course;
import com.courseplanner.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private com.courseplanner.service.CourseService courseService;
    
    @Autowired
    private com.courseplanner.service.EnrollmentService enrollmentService;
    
    @Autowired
    private com.courseplanner.service.TaskService taskService;

    /**
     * User signup endpoint
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> signup(@RequestBody SignupRequest signupRequest) {
        try {
            User user = userService.signup(signupRequest);
            return ResponseEntity.ok(ApiResponse.success("User registered successfully", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody LoginRequest loginRequest) {
        try {
            User user = userService.login(loginRequest);
            return ResponseEntity.ok(ApiResponse.success("Login successful", user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get user profile
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> getUserProfile(@PathVariable String userId) {
        try {
            User user = userService.getUserProfile(userId);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update user profile
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<User>> updateProfile(@PathVariable String userId, @RequestBody User updatedUser) {
        try {
            User user = userService.updateProfile(userId, updatedUser);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Change user password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody PasswordChangeRequest request) {
        try {
            userService.changePassword(request.getUserId(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "Password updated"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get leaderboard
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<User>>> getLeaderboard() {
        List<User> leaderboard = userService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.success("Leaderboard retrieved successfully", leaderboard));
    }

    /**
     * Check if username exists
     */
    @GetMapping("/check-username/{username}")
    public ResponseEntity<ApiResponse<Boolean>> checkUsername(@PathVariable String username) {
        boolean exists = userService.usernameExists(username);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    /**
     * Check if email exists
     */
    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(@PathVariable String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    /**
     * Update user score (internal endpoint)
     */
    @PostMapping("/{userId}/score")
    public ResponseEntity<ApiResponse<User>> updateScore(@PathVariable String userId, @RequestParam int points) {
        try {
            User user = userService.updateUserScore(userId, points);
            return ResponseEntity.ok(ApiResponse.success("Score updated successfully", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Update user interests and complete onboarding
     */
    @PostMapping("/onboarding")
    public ResponseEntity<ApiResponse<User>> completeOnboarding(@RequestBody OnboardingRequest onboardingRequest) {
        try {
            User user = userService.updateUserInterests(onboardingRequest);
            return ResponseEntity.ok(ApiResponse.success("Onboarding completed successfully", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Analyze user interests with AI
     */
    @PostMapping("/analyze-interests")
    public ResponseEntity<ApiResponse<AIAnalysisResponse>> analyzeInterests(@RequestBody OnboardingRequest onboardingRequest) {
        try {
            AIAnalysisResponse analysis = userService.analyzeInterestsWithAI(onboardingRequest);
            return ResponseEntity.ok(ApiResponse.success("Analysis completed successfully", analysis));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Check if user has completed onboarding
     */
    @GetMapping("/{userId}/onboarding-status")
    public ResponseEntity<ApiResponse<Boolean>> checkOnboardingStatus(@PathVariable String userId) {
        try {
            boolean completed = userService.isOnboardingCompleted(userId);
            return ResponseEntity.ok(ApiResponse.success(completed));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 💾 Save AI-recommended courses to user_courses collection
     * This stores personalized course recommendations for the user
     */
    @PostMapping("/{userId}/recommendations")
    public ResponseEntity<ApiResponse<String>> saveRecommendations(
            @PathVariable String userId, 
            @RequestBody RecommendationsRequest request) {
        try {
            userService.saveUserCourseRecommendations(userId, request.getRecommendations());
            return ResponseEntity.ok(ApiResponse.success("Recommendations saved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Get dashboard statistics for the current user (student dashboard)
     */
    @GetMapping("/{userId}/dashboard-stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getDashboardStats(
            @PathVariable String userId) {
        try {
            // Get user details
            User user = userService.getUserProfile(userId);
            
            // Get enrolled courses count and completed courses count
            long totalCourses = enrollmentService.getUserEnrollmentCount(userId);
            long completedCourses = enrollmentService.getCompletedCoursesCount(userId);
            
            // Get user tasks
            List<com.courseplanner.model.Task> allTasks = taskService.getUserTasks(userId);
            System.out.println("Dashboard Stats - Total tasks found: " + allTasks.size());
            
            long activeTasks = allTasks.stream()
                    .filter(task -> {
                        boolean notCompleted = !task.isCompleted();
                        System.out.println("Task: " + task.getTitle() + ", isCompleted: " + task.isCompleted() + ", status: " + task.getStatus());
                        return notCompleted;
                    })
                    .count();
                    
            long completedTasks = allTasks.stream()
                    .filter(task -> {
                        boolean completed = task.isCompleted();
                        return completed;
                    })
                    .count();
                    
            System.out.println("Active tasks: " + activeTasks + ", Completed tasks: " + completedTasks);
            
            // Calculate study streak (placeholder - can be enhanced later)
            Integer studyStreakDaysObj = user.getStudyStreakDays();
            int studyStreakDays = studyStreakDaysObj != null ? studyStreakDaysObj : 0;
            
            // Calculate total study hours from enrolled courses
            List<com.courseplanner.model.EnrolledCourse> enrolledCourses = enrollmentService.getUserEnrolledCourses(userId);
            int totalStudyHours = 0;
            for (com.courseplanner.model.EnrolledCourse enrollment : enrolledCourses) {
                // Estimate study hours based on progress percentage and a base of 10 hours per course
                totalStudyHours += (enrollment.getProgressPercentage() * 10) / 100;
            }
            
            // Get XP points and level
            Integer xpPointsObj = user.getXpPoints();
            int xpPoints = xpPointsObj != null ? xpPointsObj : 0;
            int currentLevel = user.getLevel();
            
            java.util.Map<String, Object> dashboardStats = new java.util.HashMap<>();
            dashboardStats.put("totalCourses", totalCourses);
            dashboardStats.put("completedCourses", completedCourses);
            dashboardStats.put("activeTasks", activeTasks);
            dashboardStats.put("completedTasks", completedTasks);
            dashboardStats.put("studyStreakDays", studyStreakDays);
            dashboardStats.put("totalStudyHours", totalStudyHours);
            dashboardStats.put("xpPoints", xpPoints);
            dashboardStats.put("currentLevel", currentLevel);
            
            return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", dashboardStats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve dashboard stats: " + e.getMessage()));
        }
    }
    
    /**
     * Get analytics for the current user (student dashboard)
     */
    @GetMapping("/analytics/{userId}")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getUserAnalytics(
            @PathVariable String userId) {
        try {
            // Get user details
            User user = userService.getUserProfile(userId);
            
            // Get user courses
            List<Course> userCourses = courseService.getUserCourses(userId);
            
            // Get enrolled courses count
            long enrolledCoursesCount = enrollmentService.getUserEnrollmentCount(userId);
            long completedCoursesCount = enrollmentService.getCompletedCoursesCount(userId);
            
            java.util.Map<String, Object> analytics = new java.util.HashMap<>();
            
            // User interests
            java.util.Map<String, Object> interestStats = new java.util.HashMap<>();
            List<String> userInterests = user.getInterests() != null ? user.getInterests() : new java.util.ArrayList<>();
            interestStats.put("totalInterests", userInterests.size());
            interestStats.put("enabledInterests", userInterests.size());
            interestStats.put("disabledInterests", 0);
            
            // Convert interests list to map with counts
            java.util.Map<String, Integer> topInterests = new java.util.LinkedHashMap<>();
            for (int i = 0; i < Math.min(5, userInterests.size()); i++) {
                topInterests.put(userInterests.get(i), 1);
            }
            interestStats.put("topInterests", topInterests);
            analytics.put("interests", interestStats);
            
            // User goals
            java.util.Map<String, Object> goalStats = new java.util.HashMap<>();
            List<String> userGoals = user.getStudyGoals() != null ? user.getStudyGoals() : new java.util.ArrayList<>();
            goalStats.put("totalGoals", userGoals.size());
            goalStats.put("enabledGoals", userGoals.size());
            goalStats.put("disabledGoals", 0);
            
            // Convert goals list to map with counts
            java.util.Map<String, Integer> topGoals = new java.util.LinkedHashMap<>();
            for (int i = 0; i < Math.min(5, userGoals.size()); i++) {
                topGoals.put(userGoals.get(i), 1);
            }
            goalStats.put("topGoals", topGoals);
            analytics.put("goals", goalStats);
            
            // User courses stats (showing enrolled courses count)
            java.util.Map<String, Object> userStats = new java.util.HashMap<>();
            userStats.put("totalUsers", enrolledCoursesCount); // Enrolled courses count
            userStats.put("adminUsers", 0);
            userStats.put("studentUsers", 0);
            userStats.put("onboardedUsers", 0);
            userStats.put("pendingOnboarding", 0);
            userStats.put("growthRate", "0%");
            userStats.put("activeToday", 0);
            analytics.put("users", userStats);
            
            // AI Recommendations stats
            java.util.Map<String, Object> recommendationStats = new java.util.HashMap<>();
            List<String> aiRecs = user.getAiRecommendations() != null ? user.getAiRecommendations() : new java.util.ArrayList<>();
            recommendationStats.put("usersWithRecommendations", aiRecs.size() > 0 ? 1 : 0);
            recommendationStats.put("totalRecommendationsGenerated", aiRecs.size());
            recommendationStats.put("averageRecommendationsPerUser", aiRecs.size());
            analytics.put("recommendations", recommendationStats);
            
            // System health
            java.util.Map<String, Object> systemHealth = new java.util.HashMap<>();
            systemHealth.put("status", "healthy");
            systemHealth.put("uptime", "99.8%");
            systemHealth.put("lastUpdated", new java.util.Date().toString());
            analytics.put("systemHealth", systemHealth);
            
            return ResponseEntity.ok(ApiResponse.success("Analytics retrieved successfully", analytics));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to retrieve analytics: " + e.getMessage()));
        }
    }
    
    /**
     * Inner class for recommendations request
     */
    public static class RecommendationsRequest {
        private String userId;
        private java.util.List<java.util.Map<String, Object>> recommendations;
        
        public String getUserId() {
            return userId;
        }
        
        public void setUserId(String userId) {
            this.userId = userId;
        }
        
        public java.util.List<java.util.Map<String, Object>> getRecommendations() {
            return recommendations;
        }
        
        public void setRecommendations(java.util.List<java.util.Map<String, Object>> recommendations) {
            this.recommendations = recommendations;
        }
    }
}
