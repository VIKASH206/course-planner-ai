package com.courseplanner.repository;

import com.courseplanner.model.ForumGroup;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ForumGroupRepository extends MongoRepository<ForumGroup, String> {
    List<ForumGroup> findByCategory(String category);
    List<ForumGroup> findByCreatedBy(String userId);
    List<ForumGroup> findByIsPrivate(boolean isPrivate);
}
