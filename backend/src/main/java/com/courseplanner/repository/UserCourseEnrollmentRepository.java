package com.courseplanner.repository;

import com.courseplanner.model.UserCourseEnrollment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCourseEnrollmentRepository extends MongoRepository<UserCourseEnrollment, String> {
    
    // Find enrollment by user and course
    Optional<UserCourseEnrollment> findByUserIdAndCourseId(String userId, String courseId);
    
    // Check if user is enrolled in course
    boolean existsByUserIdAndCourseId(String userId, String courseId);
    
    // Find all enrollments for a user
    List<UserCourseEnrollment> findByUserId(String userId);
    
    // Find active enrollments for a user
    List<UserCourseEnrollment> findByUserIdAndIsActive(String userId, boolean isActive);
    
    // Find completed enrollments for a user
    List<UserCourseEnrollment> findByUserIdAndIsCompleted(String userId, boolean isCompleted);
    
    // Find all enrollments for a course
    List<UserCourseEnrollment> findByCourseId(String courseId);
    
    // Count enrollments for a course
    long countByCourseId(String courseId);
    
    // Count completed enrollments for a user
    long countByUserIdAndIsCompleted(String userId, boolean isCompleted);
    
    // Find user's enrolled course IDs
    @Query(value = "{'userId': ?0}", fields = "{'courseId': 1}")
    List<UserCourseEnrollment> findCourseIdsByUserId(String userId);
    
    // Count completed enrollments
    long countByIsCompleted(boolean isCompleted);
    
    // Count by completion status and active status
    long countByIsCompletedAndIsActive(boolean isCompleted, boolean isActive);
}
