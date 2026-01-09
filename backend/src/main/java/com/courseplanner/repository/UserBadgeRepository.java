package com.courseplanner.repository;

import com.courseplanner.model.UserBadge;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends MongoRepository<UserBadge, String> {
    
    /**
     * Find all badges earned by a user
     */
    List<UserBadge> findByUserIdOrderByEarnedAtDesc(String userId);
    
    /**
     * Find displayed badges for a user
     */
    List<UserBadge> findByUserIdAndIsDisplayedOrderByEarnedAtDesc(String userId, boolean isDisplayed);
    
    /**
     * Find badges earned by a user for a specific course
     */
    List<UserBadge> findByUserIdAndCourseIdOrderByEarnedAtDesc(String userId, String courseId);
    
    /**
     * Check if user has earned a specific badge
     */
    Optional<UserBadge> findByUserIdAndBadgeId(String userId, String badgeId);
    
    /**
     * Find badges earned in a specific time period
     */
    List<UserBadge> findByUserIdAndEarnedAtBetweenOrderByEarnedAtDesc(String userId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find recent badges earned by a user
     */
    List<UserBadge> findByUserIdAndEarnedAtAfterOrderByEarnedAtDesc(String userId, LocalDateTime after);
    
    /**
     * Count total badges earned by a user
     */
    long countByUserId(String userId);
    
    /**
     * Count badges earned for a specific course
     */
    long countByUserIdAndCourseId(String userId, String courseId);
    
    /**
     * Find users who earned a specific badge
     */
    List<UserBadge> findByBadgeIdOrderByEarnedAtDesc(String badgeId);
    
    /**
     * Find badges earned for a specific entity (course, quiz, etc.)
     */
    List<UserBadge> findByUserIdAndRelatedEntityIdOrderByEarnedAtDesc(String userId, String relatedEntityId);
}