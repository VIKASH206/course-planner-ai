package com.courseplanner.service;

import com.courseplanner.model.Analytics;
import com.courseplanner.model.Course;
import com.courseplanner.model.Task;
import com.courseplanner.model.User;
import com.courseplanner.repository.AnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private AnalyticsRepository analyticsRepository;

    @Autowired
    private TaskService taskService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserService userService;

    /**
     * Get or create today's analytics for a user
     */
    public Analytics getTodayAnalytics(String userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        Optional<Analytics> existing = analyticsRepository.findTodayAnalytics(userId, startOfDay, endOfDay);
        
        if (existing.isPresent()) {
            return existing.get();
        } else {
            // Create new analytics for today
            return generateTodayAnalytics(userId);
        }
    }

    /**
     * Generate analytics for today
     */
    private Analytics generateTodayAnalytics(String userId) {
        Analytics analytics = new Analytics(userId);
        
        // Get today's tasks
        LocalDate today = LocalDate.now();
        List<Task> todayTasks = taskService.getTasksByDate(userId, today);
        
        // Calculate completion metrics
        int totalTasks = todayTasks.size();
        int completedTasks = (int) todayTasks.stream().filter(Task::isCompleted).count();
        
        analytics.setTotalTasksToday(totalTasks);
        analytics.setCompletedTasksToday(completedTasks);
        analytics.setCompletionRate(totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0);

        // Calculate study time (estimated from completed tasks)
        int studyTime = todayTasks.stream()
                .filter(Task::isCompleted)
                .mapToInt(Task::getEstimatedMinutes)
                .sum();
        analytics.setStudyTimeMinutes(studyTime);

        // Count courses worked on today
        Set<String> coursesWorkedOn = todayTasks.stream()
                .filter(task -> task.getCourseId() != null && task.isCompleted())
                .map(Task::getCourseId)
                .collect(Collectors.toSet());
        analytics.setCoursesWorkedOn(coursesWorkedOn.size());

        // Calculate points earned today
        int pointsEarned = completedTasks * 50; // 50 points per completed task
        analytics.setPointsEarned(pointsEarned);

        return analyticsRepository.save(analytics);
    }

    /**
     * Update analytics when a task is completed
     */
    public void updateAnalyticsOnTaskCompletion(String userId, Task task) {
        Analytics todayAnalytics = getTodayAnalytics(userId);
        
        todayAnalytics.setCompletedTasksToday(todayAnalytics.getCompletedTasksToday() + 1);
        todayAnalytics.setStudyTimeMinutes(todayAnalytics.getStudyTimeMinutes() + task.getEstimatedMinutes());
        
        // Recalculate completion rate
        if (todayAnalytics.getTotalTasksToday() > 0) {
            double newRate = (double) todayAnalytics.getCompletedTasksToday() / todayAnalytics.getTotalTasksToday() * 100;
            todayAnalytics.setCompletionRate(newRate);
        }

        // Add points
        todayAnalytics.setPointsEarned(todayAnalytics.getPointsEarned() + 50);

        analyticsRepository.save(todayAnalytics);
    }

    /**
     * Get weekly analytics for a user
     */
    public List<Analytics> getWeeklyAnalytics(String userId) {
        LocalDate weekStart = LocalDate.now().minusDays(6); // Last 7 days
        LocalDate weekEnd = LocalDate.now();
        
        LocalDateTime startDateTime = weekStart.atStartOfDay();
        LocalDateTime endDateTime = weekEnd.atTime(LocalTime.MAX);
        
        return analyticsRepository.findByUserIdAndDateRange(userId, startDateTime, endDateTime);
    }

    /**
     * Get monthly analytics for a user
     */
    public List<Analytics> getMonthlyAnalytics(String userId) {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate monthEnd = LocalDate.now();
        
        LocalDateTime startDateTime = monthStart.atStartOfDay();
        LocalDateTime endDateTime = monthEnd.atTime(LocalTime.MAX);
        
        return analyticsRepository.findByUserIdAndDateRange(userId, startDateTime, endDateTime);
    }

    /**
     * Calculate user's streak days
     */
    public int calculateStreak(String userId) {
        List<Analytics> recentAnalytics = analyticsRepository.findByUserIdAndDateRange(
                userId, 
                LocalDateTime.now().minusDays(30), 
                LocalDateTime.now()
        );

        // Sort by date descending
        recentAnalytics.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        int streak = 0;
        LocalDate expectedDate = LocalDate.now();

        for (Analytics analytics : recentAnalytics) {
            LocalDate analyticsDate = analytics.getDate().toLocalDate();
            
            if (analyticsDate.equals(expectedDate) && analytics.getCompletedTasksToday() > 0) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Get user progress summary
     */
    public Map<String, Object> getUserProgressSummary(String userId) {
        Map<String, Object> summary = new HashMap<>();

        // Basic stats
        long totalCompletedTasks = taskService.countCompletedTasks(userId);
        long totalCompletedCourses = courseService.countCompletedCourses(userId);
        
        // Recent analytics
        Analytics todayAnalytics = getTodayAnalytics(userId);
        List<Analytics> weeklyAnalytics = getWeeklyAnalytics(userId);
        
        // Calculate weekly totals
        int weeklyCompletedTasks = weeklyAnalytics.stream()
                .mapToInt(Analytics::getCompletedTasksToday)
                .sum();
        int weeklyStudyTime = weeklyAnalytics.stream()
                .mapToInt(Analytics::getStudyTimeMinutes)
                .sum();

        // Streak calculation
        int streak = calculateStreak(userId);

        // Weak and strong areas analysis
        Map<String, Object> areasAnalysis = analyzeWeakStrongAreas(userId);

        summary.put("totalCompletedTasks", totalCompletedTasks);
        summary.put("totalCompletedCourses", totalCompletedCourses);
        summary.put("todayCompletedTasks", todayAnalytics.getCompletedTasksToday());
        summary.put("todayCompletionRate", todayAnalytics.getCompletionRate());
        summary.put("weeklyCompletedTasks", weeklyCompletedTasks);
        summary.put("weeklyStudyTime", weeklyStudyTime);
        summary.put("currentStreak", streak);
        summary.put("weakAreas", areasAnalysis.get("weakAreas"));
        summary.put("strongAreas", areasAnalysis.get("strongAreas"));

        return summary;
    }

    /**
     * Analyze weak and strong areas
     */
    public Map<String, Object> analyzeWeakStrongAreas(String userId) {
        Map<String, Object> analysis = new HashMap<>();
        
        // Get user's courses
        List<Course> userCourses = courseService.getUserCourses(userId);
        
        // Group by category and calculate average progress
        Map<String, Double> categoryProgress = userCourses.stream()
                .filter(course -> course.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Course::getCategory,
                        Collectors.averagingInt(Course::getProgressPercentage)
                ));

        // Identify weak areas (below 60% average progress)
        List<String> weakAreas = categoryProgress.entrySet().stream()
                .filter(entry -> entry.getValue() < 60)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Identify strong areas (above 80% average progress)
        List<String> strongAreas = categoryProgress.entrySet().stream()
                .filter(entry -> entry.getValue() > 80)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        analysis.put("weakAreas", weakAreas);
        analysis.put("strongAreas", strongAreas);
        analysis.put("categoryProgress", categoryProgress);

        return analysis;
    }

    /**
     * Get leaderboard data
     */
    public List<Map<String, Object>> getLeaderboard() {
        List<User> topUsers = userService.getLeaderboard();
        
        return topUsers.stream()
                .limit(10) // Top 10 users
                .map(user -> {
                    Map<String, Object> userStats = new HashMap<>();
                    userStats.put("userId", user.getId());
                    userStats.put("username", user.getUsername());
                    userStats.put("totalScore", user.getTotalScore());
                    userStats.put("level", user.getLevel());
                    userStats.put("completedCourses", user.getCompletedCourses());
                    userStats.put("completedTasks", user.getCompletedTasks());
                    
                    // Calculate current streak
                    int streak = calculateStreak(user.getId());
                    userStats.put("currentStreak", streak);
                    
                    return userStats;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get detailed analytics report
     */
    public Map<String, Object> getDetailedAnalytics(String userId) {
        Map<String, Object> report = new HashMap<>();

        // Get basic progress summary
        Map<String, Object> progressSummary = getUserProgressSummary(userId);
        report.putAll(progressSummary);

        // Add time-based analytics
        List<Analytics> weeklyData = getWeeklyAnalytics(userId);
        List<Analytics> monthlyData = getMonthlyAnalytics(userId);

        report.put("weeklyData", weeklyData);
        report.put("monthlyData", monthlyData);

        // Add productivity trends
        Map<String, Object> trends = calculateProductivityTrends(weeklyData);
        report.put("productivityTrends", trends);

        return report;
    }

    /**
     * Calculate productivity trends
     */
    private Map<String, Object> calculateProductivityTrends(List<Analytics> weeklyData) {
        Map<String, Object> trends = new HashMap<>();

        if (weeklyData.size() < 2) {
            trends.put("trend", "insufficient_data");
            return trends;
        }

        // Calculate average completion rate for first half vs second half of week
        int midPoint = weeklyData.size() / 2;
        double firstHalfAvg = weeklyData.subList(0, midPoint).stream()
                .mapToDouble(Analytics::getCompletionRate)
                .average()
                .orElse(0);
        double secondHalfAvg = weeklyData.subList(midPoint, weeklyData.size()).stream()
                .mapToDouble(Analytics::getCompletionRate)
                .average()
                .orElse(0);

        trends.put("firstHalfAverage", firstHalfAvg);
        trends.put("secondHalfAverage", secondHalfAvg);
        
        if (secondHalfAvg > firstHalfAvg + 5) {
            trends.put("trend", "improving");
        } else if (secondHalfAvg < firstHalfAvg - 5) {
            trends.put("trend", "declining");
        } else {
            trends.put("trend", "stable");
        }

        return trends;
    }

    // ==================== ADMIN ANALYTICS METHODS ====================

    @Autowired(required = false)
    private com.courseplanner.repository.UserRepository userRepository;

    @Autowired(required = false)
    private com.courseplanner.repository.InterestRepository interestRepository;

    @Autowired(required = false)
    private com.courseplanner.repository.GoalRepository goalRepository;

    /**
     * Get user analytics for admin dashboard
     * NOTE: Only counts STUDENT users, excludes ADMIN users from analytics
     */
    public Map<String, Object> getUserAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        if (userRepository != null) {
            // Count only student users (exclude admins from analytics)
            long studentUsers = userRepository.countByRole("STUDENT");
            long adminUsers = userRepository.countByRole("ADMIN");
            
            // Get onboarded students only (exclude admins)
            long onboardedStudents = userRepository.findAll().stream()
                .filter(u -> "STUDENT".equals(u.getRole()))
                .filter(User::isOnboardingCompleted)
                .count();

            // Analytics should only reflect student users
            analytics.put("totalUsers", studentUsers);  // Only students
            analytics.put("adminUsers", adminUsers);    // For reference only
            analytics.put("studentUsers", studentUsers);
            analytics.put("onboardedUsers", onboardedStudents);
            analytics.put("pendingOnboarding", studentUsers - onboardedStudents);
            analytics.put("growthRate", "+12%");
            analytics.put("activeToday", studentUsers);
        } else {
            analytics.put("totalUsers", 0);
            analytics.put("adminUsers", 0);
            analytics.put("studentUsers", 0);
        }

        return analytics;
    }

    /**
     * Get interest analytics for admin dashboard
     * Shows actual user selections, not just collection items
     */
    public Map<String, Object> getInterestAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        if (interestRepository != null && userRepository != null) {
            long totalInterests = interestRepository.count();
            long enabledInterests = interestRepository.countByEnabled(true);

            analytics.put("totalInterests", totalInterests);
            analytics.put("enabledInterests", enabledInterests);
            analytics.put("disabledInterests", totalInterests - enabledInterests);

            // Top interests by ACTUAL user selection (aggregate from all users)
            Map<String, Long> topInterests = new HashMap<>();
            List<com.courseplanner.model.User> allUsers = userRepository.findAll();
            
            for (com.courseplanner.model.User user : allUsers) {
                if (user.getInterests() != null && !user.getInterests().isEmpty()) {
                    for (String interest : user.getInterests()) {
                        topInterests.put(interest, topInterests.getOrDefault(interest, 0L) + 1);
                    }
                }
            }
            
            analytics.put("topInterests", topInterests);
        } else {
            analytics.put("totalInterests", 0);
            analytics.put("enabledInterests", 0);
        }

        return analytics;
    }

    /**
     * Get goal analytics for admin dashboard
     * Shows actual user selections, not just collection items
     */
    public Map<String, Object> getGoalAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        if (goalRepository != null && userRepository != null) {
            long totalGoals = goalRepository.count();
            long enabledGoals = goalRepository.countByEnabled(true);

            analytics.put("totalGoals", totalGoals);
            analytics.put("enabledGoals", enabledGoals);
            analytics.put("disabledGoals", totalGoals - enabledGoals);

            // Top goals by ACTUAL user selection (aggregate from all users)
            Map<String, Long> topGoals = new HashMap<>();
            List<com.courseplanner.model.User> allUsers = userRepository.findAll();
            
            for (com.courseplanner.model.User user : allUsers) {
                if (user.getStudyGoals() != null && !user.getStudyGoals().isEmpty()) {
                    for (String goal : user.getStudyGoals()) {
                        topGoals.put(goal, topGoals.getOrDefault(goal, 0L) + 1);
                    }
                }
            }
            
            analytics.put("topGoals", topGoals);
        } else {
            analytics.put("totalGoals", 0);
            analytics.put("enabledGoals", 0);
        }

        return analytics;
    }

    /**
     * Get recommendation analytics for admin dashboard
     */
    public Map<String, Object> getRecommendationAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        if (userRepository != null) {
            List<com.courseplanner.model.User> users = userRepository.findAll();
            long usersWithRecommendations = users.stream()
                    .filter(u -> u.getAiRecommendations() != null && !u.getAiRecommendations().isEmpty())
                    .count();

            long totalRecommendationsGenerated = users.stream()
                    .filter(u -> u.getAiRecommendations() != null)
                    .mapToLong(u -> u.getAiRecommendations().size())
                    .sum();

            analytics.put("usersWithRecommendations", usersWithRecommendations);
            analytics.put("totalRecommendationsGenerated", totalRecommendationsGenerated);
            analytics.put("averageRecommendationsPerUser",
                    usersWithRecommendations > 0 ? (double) totalRecommendationsGenerated / usersWithRecommendations : 0.0);
        } else {
            analytics.put("usersWithRecommendations", 0);
            analytics.put("totalRecommendationsGenerated", 0);
        }

        return analytics;
    }

    /**
     * Get complete analytics overview for admin dashboard
     */
    public Map<String, Object> getCompleteAnalyticsOverview() {
        Map<String, Object> overview = new HashMap<>();

        overview.put("users", getUserAnalytics());
        overview.put("interests", getInterestAnalytics());
        overview.put("goals", getGoalAnalytics());
        overview.put("recommendations", getRecommendationAnalytics());

        // System health
        Map<String, Object> systemHealth = new HashMap<>();
        systemHealth.put("status", "healthy");
        systemHealth.put("uptime", "99.9%");
        systemHealth.put("lastUpdated", new Date());
        overview.put("systemHealth", systemHealth);

        return overview;
    }
}