package com.courseplanner.repository;

import com.courseplanner.model.BrowseCourse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrowseCourseRepository extends MongoRepository<BrowseCourse, String> {
    
    // Find published courses only
    Page<BrowseCourse> findByIsPublished(boolean isPublished, Pageable pageable);
    
    // Find by category
    Page<BrowseCourse> findByCategoryAndIsPublished(String category, boolean isPublished, Pageable pageable);
    
    // Find by difficulty
    Page<BrowseCourse> findByDifficultyAndIsPublished(String difficulty, boolean isPublished, Pageable pageable);
    
    // Find by category and difficulty
    Page<BrowseCourse> findByCategoryAndDifficultyAndIsPublished(
        String category, String difficulty, boolean isPublished, Pageable pageable);
    
    // Search by title or description
    @Query("{ 'isPublished': true, $or: [ " +
           "{'title': {$regex: ?0, $options: 'i'}}, " +
           "{'description': {$regex: ?0, $options: 'i'}}, " +
           "{'tags': {$regex: ?0, $options: 'i'}} " +
           "]}")
    Page<BrowseCourse> searchCourses(String searchTerm, Pageable pageable);
    
    // Advanced search with filters
    @Query("{ 'isPublished': true, " +
           "$or: [ " +
           "{'title': {$regex: ?0, $options: 'i'}}, " +
           "{'description': {$regex: ?0, $options: 'i'}} " +
           "], " +
           "?1 }")
    Page<BrowseCourse> searchWithFilters(String searchTerm, String filterQuery, Pageable pageable);
    
    // Find featured courses
    List<BrowseCourse> findByIsFeaturedAndIsPublished(boolean isFeatured, boolean isPublished);
    
    // Find trending courses
    List<BrowseCourse> findByIsTrendingAndIsPublished(boolean isTrending, boolean isPublished);
    
    // Find by tags
    @Query("{'tags': {$in: ?0}, 'isPublished': true}")
    Page<BrowseCourse> findByTagsIn(List<String> tags, Pageable pageable);
    
    // Find popular courses (sorted by popularity score)
    @Query("{'isPublished': true}")
    List<BrowseCourse> findTopPopularCourses(Pageable pageable);
    
    // Find new courses (recently created)
    List<BrowseCourse> findByIsPublishedOrderByCreatedAtDesc(boolean isPublished, Pageable pageable);
    
    // Find by duration range
    @Query("{'duration': {$gte: ?0, $lte: ?1}, 'isPublished': true}")
    Page<BrowseCourse> findByDurationRange(int minDuration, int maxDuration, Pageable pageable);
    
    // Count by category
    long countByCategoryAndIsPublished(String category, boolean isPublished);
    
    // Count by difficulty
    long countByDifficultyAndIsPublished(String difficulty, boolean isPublished);
    
    // Count by published status
    long countByIsPublished(boolean isPublished);
    
    // Count by coming soon status
    long countByIsComingSoon(boolean isComingSoon);
}
