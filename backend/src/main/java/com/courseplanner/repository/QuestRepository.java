package com.courseplanner.repository;

import com.courseplanner.model.Quest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestRepository extends MongoRepository<Quest, String> {
    
    /**
     * Find all active quests
     */
    List<Quest> findByIsActiveTrue();
    
    /**
     * Find quests by type
     */
    List<Quest> findByTypeAndIsActiveTrue(String type);
    
    /**
     * Find quests by category
     */
    List<Quest> findByCategoryAndIsActiveTrue(String category);
    
    /**
     * Find quests by difficulty
     */
    List<Quest> findByDifficultyAndIsActiveTrue(String difficulty);
}
