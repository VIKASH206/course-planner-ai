package com.courseplanner.repository;

import com.courseplanner.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    
    // Find courses by user ID
    List<Course> findByUserId(String userId);
    
    // Find active courses by user ID
    List<Course> findByUserIdAndIsActive(String userId, boolean isActive);
    
    // Find completed courses by user ID
    List<Course> findByUserIdAndIsCompleted(String userId, boolean isCompleted);
    
    // Find courses by category
    List<Course> findByCategory(String category);
    
    // Find courses by difficulty level
    List<Course> findByDifficulty(String difficulty);
    
    // Find courses by tags
    @Query("{'tags': {$in: ?0}}")
    List<Course> findByTagsIn(List<String> tags);
    
    // Find courses by progress range
    @Query("{'progressPercentage': {$gte: ?0, $lte: ?1}}")
    List<Course> findByProgressRange(int minProgress, int maxProgress);
    
    // Find courses by user and category
    List<Course> findByUserIdAndCategory(String userId, String category);
    
    // Search courses by title or description (case insensitive)
    @Query("{ $or: [ " +
           "{'title': {$regex: ?0, $options: 'i'}}, " +
           "{'description': {$regex: ?0, $options: 'i'}} " +
           "]}")
    List<Course> searchByTitleOrDescription(String searchTerm);
    
    // Count completed courses by user
    long countByUserIdAndIsCompleted(String userId, boolean isCompleted);
}