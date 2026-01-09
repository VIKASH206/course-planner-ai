package com.courseplanner.repository;

import com.courseplanner.model.AIRecommendationLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIRecommendationLogRepository extends MongoRepository<AIRecommendationLog, String> {
    
    // Count logs created between two dates (for today's count)
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find logs by userId
    List<AIRecommendationLog> findByUserId(String userId);
    
    // Find logs created between dates
    List<AIRecommendationLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Count total recommendation events for a user
    long countByUserId(String userId);
    
    // Get recent logs
    List<AIRecommendationLog> findTop10ByOrderByCreatedAtDesc();
}
