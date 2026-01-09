package com.courseplanner.repository;

import com.courseplanner.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    
    // Find tasks by user ID
    List<Task> findByUserId(String userId);
    
    // Find tasks by user ID and status
    List<Task> findByUserIdAndStatus(String userId, String status);
    
    // Find tasks by course ID
    List<Task> findByCourseId(String courseId);
    
    // Find tasks by user and course
    List<Task> findByUserIdAndCourseId(String userId, String courseId);
    
    // Find tasks by deadline range (calendar view)
    @Query("{'deadline': {$gte: ?0, $lte: ?1}}")
    List<Task> findByDeadlineBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find tasks by user and deadline range
    @Query("{'userId': ?0, 'deadline': {$gte: ?1, $lte: ?2}}")
    List<Task> findByUserIdAndDeadlineBetween(String userId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find overdue tasks
    @Query("{'deadline': {$lt: ?0}, 'status': {$ne: 'completed'}}")
    List<Task> findOverdueTasks(LocalDateTime currentTime);
    
    // Find overdue tasks by user
    @Query("{'userId': ?0, 'deadline': {$lt: ?1}, 'status': {$ne: 'completed'}}")
    List<Task> findOverdueTasksByUser(String userId, LocalDateTime currentTime);
    
    // Find tasks by priority
    List<Task> findByPriority(String priority);
    
    // Find tasks by user and priority
    List<Task> findByUserIdAndPriority(String userId, String priority);
    
    // Find upcoming tasks (next 24 hours)
    @Query("{'userId': ?0, 'deadline': {$gte: ?1, $lte: ?2}, 'status': {$ne: 'completed'}}")
    List<Task> findUpcomingTasks(String userId, LocalDateTime now, LocalDateTime tomorrow);
    
    // Count completed tasks by user
    long countByUserIdAndIsCompleted(String userId, boolean isCompleted);
    
    // Count tasks by user and status
    long countByUserIdAndStatus(String userId, String status);
    
    // Find tasks with reminders due
    @Query("{'reminderTime': {$lte: ?0}, 'status': {$ne: 'completed'}}")
    List<Task> findTasksWithDueReminders(LocalDateTime currentTime);
}