package com.courseplanner.repository;

import com.courseplanner.model.Analytics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticsRepository extends MongoRepository<Analytics, String> {
    
    // Find analytics by user ID
    List<Analytics> findByUserId(String userId);
    
    // Find today's analytics for a user
    @Query("{'userId': ?0, 'date': {$gte: ?1, $lt: ?2}}")
    Optional<Analytics> findTodayAnalytics(String userId, LocalDateTime startOfDay, LocalDateTime endOfDay);
    
    // Find analytics by user and date range
    @Query("{'userId': ?0, 'date': {$gte: ?1, $lte: ?2}}")
    List<Analytics> findByUserIdAndDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find weekly analytics for a user
    @Query("{'userId': ?0, 'date': {$gte: ?1, $lte: ?2}}")
    List<Analytics> findWeeklyAnalytics(String userId, LocalDateTime weekStart, LocalDateTime weekEnd);
    
    // Find monthly analytics for a user
    @Query("{'userId': ?0, 'date': {$gte: ?1, $lte: ?2}}")
    List<Analytics> findMonthlyAnalytics(String userId, LocalDateTime monthStart, LocalDateTime monthEnd);
    
    // Get all users' latest analytics (for leaderboard)
    @Query(value = "{}", sort = "{'date': -1}")
    List<Analytics> findLatestAnalytics();
    
    // Find users with highest streak
    @Query(value = "{}", sort = "{'streakDays': -1}")
    List<Analytics> findByHighestStreak();
    
    // Find users with highest points this week
    @Query(value = "{'date': {$gte: ?0}}", sort = "{'pointsEarned': -1}")
    List<Analytics> findTopPointsThisWeek(LocalDateTime weekStart);
}