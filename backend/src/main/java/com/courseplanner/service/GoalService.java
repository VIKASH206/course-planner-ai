package com.courseplanner.service;

import com.courseplanner.model.Goal;
import com.courseplanner.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GoalService {
    
    @Autowired
    private GoalRepository goalRepository;
    
    /**
     * Get all goals
     */
    public List<Goal> getAllGoals() {
        return goalRepository.findAllByOrderByOrderIndexAsc();
    }
    
    /**
     * Get all enabled goals
     */
    public List<Goal> getEnabledGoals() {
        return goalRepository.findByEnabledOrderByOrderIndexAsc(true);
    }
    
    /**
     * Get goal by ID
     */
    public Goal getGoalById(String id) {
        return goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + id));
    }
    
    /**
     * Get goals by interest ID
     */
    public List<Goal> getGoalsByInterestId(String interestId) {
        return goalRepository.findByInterestIdsContaining(interestId);
    }
    
    /**
     * Create new goal
     */
    public Goal createGoal(Goal goal) {
        // Check if name already exists
        if (goalRepository.findByName(goal.getName()).isPresent()) {
            throw new RuntimeException("Goal with name '" + goal.getName() + "' already exists");
        }
        return goalRepository.save(goal);
    }
    
    /**
     * Update goal
     */
    public Goal updateGoal(String id, Goal updatedGoal) {
        Goal existing = getGoalById(id);
        
        // Check if name is being changed and if new name already exists
        if (!existing.getName().equals(updatedGoal.getName())) {
            if (goalRepository.findByName(updatedGoal.getName()).isPresent()) {
                throw new RuntimeException("Goal with name '" + updatedGoal.getName() + "' already exists");
            }
        }
        
        existing.setName(updatedGoal.getName());
        existing.setDescription(updatedGoal.getDescription());
        existing.setIconUrl(updatedGoal.getIconUrl());
        existing.setInterestIds(updatedGoal.getInterestIds());
        existing.setEnabled(updatedGoal.isEnabled());
        existing.setOrderIndex(updatedGoal.getOrderIndex());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return goalRepository.save(existing);
    }
    
    /**
     * Delete goal
     */
    public void deleteGoal(String id) {
        if (!goalRepository.existsById(id)) {
            throw new RuntimeException("Goal not found with id: " + id);
        }
        goalRepository.deleteById(id);
    }
    
    /**
     * Enable/Disable goal
     */
    public Goal toggleGoalStatus(String id, boolean enabled) {
        Goal goal = getGoalById(id);
        goal.setEnabled(enabled);
        goal.setUpdatedAt(LocalDateTime.now());
        return goalRepository.save(goal);
    }
    
    /**
     * Count total goals
     */
    public long countGoals() {
        return goalRepository.count();
    }
}
