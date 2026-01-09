package com.courseplanner.repository;

import com.courseplanner.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    
    // Find user by username for login
    Optional<User> findByUsername(String username);
    
    // Find user by email for login and validation
    Optional<User> findByEmail(String email);
    
    // Find user by email (case-insensitive)
    @Query("{'email': {$regex: '^?0$', $options: 'i'}}")
    Optional<User> findByEmailIgnoreCase(String email);
    
    // Check if username exists
    boolean existsByUsername(String username);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if email exists (case-insensitive)
    @Query(value = "{'email': {$regex: '^?0$', $options: 'i'}}", exists = true)
    boolean existsByEmailIgnoreCase(String email);
    
    // Find users by score range for leaderboard
    @Query("{'totalScore': {$gte: ?0, $lte: ?1}}")
    List<User> findByScoreRange(int minScore, int maxScore);
    
    // Get top users by score for leaderboard
    @Query(value = "{}", sort = "{'totalScore': -1}")
    List<User> findTopUsersByScore();
    
    // Find users by level
    List<User> findByLevel(int level);
    
    // Find users by role (for filtering students/admins)
    List<User> findByRole(String role);
    
    // Count users by role
    long countByRole(String role);
    
    // Count users by account status
    long countByAccountStatus(String accountStatus);
    
    // Count users by role and account status
    long countByRoleAndAccountStatus(String role, String accountStatus);
    
    // Find user by reset token
    Optional<User> findByResetToken(String resetToken);
    
    // Count users by onboarding status
    long countByOnboardingCompleted(boolean onboardingCompleted);
    
    // Count users by interests containing a specific interest
    long countByInterestsContaining(String interest);
    
    // Count users by study goals containing a specific goal
    long countByStudyGoalsContaining(String goal);
}