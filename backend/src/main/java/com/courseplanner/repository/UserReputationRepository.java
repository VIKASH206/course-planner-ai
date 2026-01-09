package com.courseplanner.repository;

import com.courseplanner.model.UserReputation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserReputationRepository extends MongoRepository<UserReputation, String> {
    Optional<UserReputation> findByUserId(String userId);
}
