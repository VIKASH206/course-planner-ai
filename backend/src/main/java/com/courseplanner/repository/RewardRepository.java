package com.courseplanner.repository;

import com.courseplanner.model.Reward;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRepository extends MongoRepository<Reward, String> {
    
    /**
     * Find all active rewards
     */
    List<Reward> findByIsActiveTrue();
    
    /**
     * Find rewards by type
     */
    List<Reward> findByTypeAndIsActiveTrue(String type);
    
    /**
     * Find rewards by cost range
     */
    List<Reward> findByCostBetweenAndIsActiveTrue(int minCost, int maxCost);
}
