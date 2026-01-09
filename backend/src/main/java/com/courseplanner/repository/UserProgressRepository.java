package com.courseplanner.repository;

import com.courseplanner.model.UserProgress;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends MongoRepository<UserProgress, String> {
    
    /**
     * Find progress for a specific user and course
     */
    Optional<UserProgress> findByUserIdAndCourseId(String userId, String courseId);
    
    /**
     * Find overall course progress (where moduleId is null)
     */
    Optional<UserProgress> findByUserIdAndCourseIdAndModuleIdIsNull(String userId, String courseId);
    
    /**
     * Find progress for a specific user, course, and module
     */
    Optional<UserProgress> findByUserIdAndCourseIdAndModuleId(String userId, String courseId, String moduleId);
    
    /**
     * Find progress for a specific user, course, module, and topic
     */
    Optional<UserProgress> findByUserIdAndCourseIdAndModuleIdAndTopicId(String userId, String courseId, String moduleId, String topicId);
    
    /**
     * Find all progress records for a user in a course
     */
    List<UserProgress> findByUserIdAndCourseIdOrderByUpdatedAtDesc(String userId, String courseId);
    
    /**
     * Find completed progress records for a user in a course
     */
    List<UserProgress> findByUserIdAndCourseIdAndIsCompletedOrderByCompletedAtDesc(String userId, String courseId, boolean isCompleted);
    
    /**
     * Find bookmarked items for a user in a course
     */
    List<UserProgress> findByUserIdAndCourseIdAndIsBookmarkedOrderByUpdatedAtDesc(String userId, String courseId, boolean isBookmarked);
    
    /**
     * Find progress records by module
     */
    List<UserProgress> findByUserIdAndModuleIdOrderByUpdatedAtDesc(String userId, String moduleId);
    
    /**
     * Find progress records by topic
     */
    List<UserProgress> findByUserIdAndTopicIdOrderByUpdatedAtDesc(String userId, String topicId);
    
    /**
     * Find recently accessed content for a user
     */
    List<UserProgress> findByUserIdAndLastAccessedAtAfterOrderByLastAccessedAtDesc(String userId, LocalDateTime after);
    
    /**
     * Find progress records by learning style
     */
    List<UserProgress> findByUserIdAndLearningStyleOrderByUpdatedAtDesc(String userId, String learningStyle);
    
    /**
     * Calculate average progress percentage for a user in a course
     */
    @Query(value = "{ 'userId': ?0, 'courseId': ?1 }", fields = "{ 'progressPercentage': 1 }")
    List<UserProgress> findProgressPercentagesForAverage(String userId, String courseId);
    
    /**
     * Find items with low comprehension scores (need review)
     */
    @Query("{ 'userId': ?0, 'courseId': ?1, 'comprehensionScore': { $lt: 0.7 } }")
    List<UserProgress> findItemsNeedingReview(String userId, String courseId);
    
    /**
     * Find items with high retry count
     */
    @Query("{ 'userId': ?0, 'courseId': ?1, 'retryCount': { $gte: ?2 } }")
    List<UserProgress> findItemsWithHighRetryCount(String userId, String courseId, int minRetryCount);
    
    /**
     * Count completed items for a user in a course
     */
    long countByUserIdAndCourseIdAndIsCompleted(String userId, String courseId, boolean isCompleted);
    
    /**
     * Find progress with low confidence levels
     */
    @Query("{ 'userId': ?0, 'courseId': ?1, 'confidenceLevel': { $lt: 0.5 } }")
    List<UserProgress> findLowConfidenceItems(String userId, String courseId);
}