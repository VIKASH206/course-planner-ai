package com.courseplanner.repository;

import com.courseplanner.model.Goal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends MongoRepository<Goal, String> {
    Optional<Goal> findByName(String name);
    List<Goal> findByEnabledOrderByOrderIndexAsc(boolean enabled);
    List<Goal> findAllByOrderByOrderIndexAsc();
    List<Goal> findByInterestIdsContaining(String interestId);
    
    // Count goals by enabled status
    long countByEnabled(boolean enabled);
    
    // Find goals by enabled status
    List<Goal> findByEnabled(boolean enabled);
}
