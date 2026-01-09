package com.courseplanner.repository;

import com.courseplanner.model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends MongoRepository<Activity, String> {
    
    // Get all activities visible to admin, sorted by timestamp descending
    List<Activity> findByVisibleToAdminOrderByTimestampDesc(boolean visibleToAdmin);
    
    // Get all activities visible to students, sorted by timestamp descending
    List<Activity> findByVisibleToStudentOrderByTimestampDesc(boolean visibleToStudent);
    
    // Get recent activities visible to admin (limit 20)
    List<Activity> findTop20ByVisibleToAdminOrderByTimestampDesc(boolean visibleToAdmin);
    
    // Get recent activities visible to students (limit 20)
    List<Activity> findTop20ByVisibleToStudentOrderByTimestampDesc(boolean visibleToStudent);
    
    // Get activities by user
    List<Activity> findByUserIdOrderByTimestampDesc(String userId);
}
