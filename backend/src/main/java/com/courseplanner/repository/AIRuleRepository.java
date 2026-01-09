package com.courseplanner.repository;

import com.courseplanner.model.AIRule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIRuleRepository extends MongoRepository<AIRule, String> {
    List<AIRule> findByEnabledOrderByPriorityDesc(boolean enabled);
    List<AIRule> findByInterestIdAndGoalId(String interestId, String goalId);
    List<AIRule> findByInterestIdAndGoalIdAndExperienceLevel(String interestId, String goalId, String experienceLevel);
}
