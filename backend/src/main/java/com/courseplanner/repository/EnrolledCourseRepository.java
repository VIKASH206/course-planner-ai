package com.courseplanner.repository;

import com.courseplanner.model.EnrolledCourse;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrolledCourseRepository extends MongoRepository<EnrolledCourse, String> {
    
    // Find all enrolled courses for a specific user
    List<EnrolledCourse> findByUserId(String userId);
    
    // Find a specific enrollment
    Optional<EnrolledCourse> findByUserIdAndCourseId(String userId, String courseId);
    
    // Count enrolled courses for a user
    long countByUserId(String userId);
    
    // Check if user is already enrolled in a course
    boolean existsByUserIdAndCourseId(String userId, String courseId);
    
    // Find completed courses for a user
    List<EnrolledCourse> findByUserIdAndIsCompleted(String userId, boolean isCompleted);
    
    // Count completed courses for a user
    long countByUserIdAndIsCompleted(String userId, boolean isCompleted);
}
