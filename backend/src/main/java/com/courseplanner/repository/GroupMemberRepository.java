package com.courseplanner.repository;

import com.courseplanner.model.GroupMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends MongoRepository<GroupMember, String> {
    List<GroupMember> findByGroupId(String groupId);
    List<GroupMember> findByUserId(String userId);
    Optional<GroupMember> findByGroupIdAndUserId(String groupId, String userId);
    int countByGroupId(String groupId);
    void deleteByGroupIdAndUserId(String groupId, String userId);
}
