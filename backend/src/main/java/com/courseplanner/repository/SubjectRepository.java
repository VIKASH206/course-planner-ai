package com.courseplanner.repository;

import com.courseplanner.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends MongoRepository<Subject, String> {
    List<Subject> findByEnabledOrderByRoadmapOrderAsc(boolean enabled);
    List<Subject> findAllByOrderByRoadmapOrderAsc();
    List<Subject> findByInterestId(String interestId);
    List<Subject> findByGoalId(String goalId);
    List<Subject> findByInterestIdAndGoalIdOrderByRoadmapOrderAsc(String interestId, String goalId);
    List<Subject> findByDifficultyLevel(String difficultyLevel);
}
