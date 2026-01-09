package com.courseplanner.repository;

import com.courseplanner.model.CourseRating;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRatingRepository extends MongoRepository<CourseRating, String> {
    
    // Find rating by user and course
    Optional<CourseRating> findByUserIdAndCourseId(String userId, String courseId);
    
    // Find all ratings for a course
    List<CourseRating> findByCourseId(String courseId);
    
    // Find all ratings by a user
    List<CourseRating> findByUserId(String userId);
    
    // Calculate average rating for a course
    @Query(value = "{'courseId': ?0}", fields = "{'rating': 1}")
    List<CourseRating> findRatingsByCourseId(String courseId);
    
    // Count ratings for a course
    long countByCourseId(String courseId);
    
    // Check if user has rated a course
    boolean existsByUserIdAndCourseId(String userId, String courseId);
}
