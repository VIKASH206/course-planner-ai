package com.courseplanner.repository;

import com.courseplanner.model.ThreadReply;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ThreadReplyRepository extends MongoRepository<ThreadReply, String> {
    List<ThreadReply> findByThreadId(String threadId);
    List<ThreadReply> findByAuthorId(String authorId);
    int countByThreadId(String threadId);
}
