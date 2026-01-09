package com.courseplanner.service;

import com.courseplanner.model.AIRule;
import com.courseplanner.repository.AIRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AIRuleService {
    
    @Autowired
    private AIRuleRepository aiRuleRepository;
    
    /**
     * Get all AI rules
     */
    public List<AIRule> getAllRules() {
        return aiRuleRepository.findAll();
    }
    
    /**
     * Get all enabled AI rules ordered by priority
     */
    public List<AIRule> getEnabledRules() {
        return aiRuleRepository.findByEnabledOrderByPriorityDesc(true);
    }
    
    /**
     * Get rule by ID
     */
    public AIRule getRuleById(String id) {
        return aiRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AI Rule not found with id: " + id));
    }
    
    /**
     * Get rules for specific interest and goal
     */
    public List<AIRule> getRulesByInterestAndGoal(String interestId, String goalId) {
        return aiRuleRepository.findByInterestIdAndGoalId(interestId, goalId);
    }
    
    /**
     * Get rules for specific interest, goal, and experience level
     */
    public List<AIRule> getRulesByInterestGoalAndExperience(String interestId, String goalId, String experienceLevel) {
        return aiRuleRepository.findByInterestIdAndGoalIdAndExperienceLevel(interestId, goalId, experienceLevel);
    }
    
    /**
     * Create new AI rule
     */
    public AIRule createRule(AIRule rule) {
        return aiRuleRepository.save(rule);
    }
    
    /**
     * Update AI rule
     */
    public AIRule updateRule(String id, AIRule updatedRule) {
        AIRule existing = getRuleById(id);
        
        existing.setName(updatedRule.getName());
        existing.setDescription(updatedRule.getDescription());
        existing.setInterestId(updatedRule.getInterestId());
        existing.setGoalId(updatedRule.getGoalId());
        existing.setExperienceLevel(updatedRule.getExperienceLevel());
        existing.setSubjectIds(updatedRule.getSubjectIds());
        existing.setSubjectOrder(updatedRule.getSubjectOrder());
        existing.setPriority(updatedRule.getPriority());
        existing.setWeight(updatedRule.getWeight());
        existing.setEnabled(updatedRule.isEnabled());
        existing.setUpdatedAt(LocalDateTime.now());
        
        return aiRuleRepository.save(existing);
    }
    
    /**
     * Delete AI rule
     */
    public void deleteRule(String id) {
        if (!aiRuleRepository.existsById(id)) {
            throw new RuntimeException("AI Rule not found with id: " + id);
        }
        aiRuleRepository.deleteById(id);
    }
    
    /**
     * Enable/Disable AI rule
     */
    public AIRule toggleRuleStatus(String id, boolean enabled) {
        AIRule rule = getRuleById(id);
        rule.setEnabled(enabled);
        rule.setUpdatedAt(LocalDateTime.now());
        return aiRuleRepository.save(rule);
    }
    
    /**
     * Count total AI rules
     */
    public long countRules() {
        return aiRuleRepository.count();
    }
}
