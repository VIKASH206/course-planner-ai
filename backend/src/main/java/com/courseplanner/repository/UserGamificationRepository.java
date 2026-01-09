package com.courseplanner.repository;

import com.courseplanner.model.UserGamification;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserGamificationRepository extends MongoRepository<UserGamification, String> {
    
    /**
     * Find user gamification by userId
     */
    Optional<UserGamification> findByUserId(String userId);
    
    /**
     * Find all user gamification records by userId (for handling duplicates)
     */
    List<UserGamification> findAllByUserId(String userId);
    
    /**
     * Find all users ordered by XP (for leaderboard)
     */
    List<UserGamification> findAllByOrderByXpDesc();
    
    /**
     * Find all users with XP greater than a value
     */
    List<UserGamification> findByXpGreaterThanEqual(int xp, Sort sort);
    
    /**
     * Find users by level
     */
    List<UserGamification> findByLevel(int level);
    
    /**
     * Check if user exists
     */
    boolean existsByUserId(String userId);
}
