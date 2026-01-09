package com.courseplanner.service;

import com.courseplanner.model.*;
import com.courseplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ForumService {
    
    @Autowired
    private ForumGroupRepository forumGroupRepository;
    
    @Autowired
    private ForumThreadRepository forumThreadRepository;
    
    @Autowired
    private ThreadReplyRepository threadReplyRepository;
    
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    
    @Autowired
    private UserReputationRepository userReputationRepository;
    
    // Forum Group Methods
    public List<ForumGroup> getAllGroups() {
        return forumGroupRepository.findAll();
    }
    
    public Optional<ForumGroup> getGroupById(String id) {
        return forumGroupRepository.findById(id);
    }
    
    public List<ForumGroup> getGroupsByCategory(String category) {
        return forumGroupRepository.findByCategory(category);
    }
    
    public ForumGroup createGroup(ForumGroup group) {
        try {
            // Set default values if missing
            if (group.getCreatedBy() == null || group.getCreatedBy().isEmpty()) {
                group.setCreatedBy("user-123"); // Default user ID
            }
            
            group.setCreatedAt(LocalDateTime.now());
            group.setLastActivity(LocalDateTime.now());
            
            // Initialize counters
            group.setMemberCount(0);
            group.setThreadCount(0);
            
            ForumGroup savedGroup = forumGroupRepository.save(group);
            System.out.println("✅ Forum group saved: " + savedGroup.getId());
            
            // Add creator as admin member
            try {
                GroupMember creator = new GroupMember();
                creator.setGroupId(savedGroup.getId());
                creator.setUserId(savedGroup.getCreatedBy());
                creator.setUserName("User"); // Should be fetched from user service
                creator.setRole("admin");
                groupMemberRepository.save(creator);
                
                // Update member count
                savedGroup.setMemberCount(1);
                return forumGroupRepository.save(savedGroup);
            } catch (Exception e) {
                System.err.println("⚠️ Error creating group member, but group created: " + e.getMessage());
                return savedGroup;
            }
        } catch (Exception e) {
            System.err.println("❌ Error in createGroup: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create forum group: " + e.getMessage());
        }
    }
    
    public ForumGroup updateGroup(String id, ForumGroup groupDetails) {
        Optional<ForumGroup> existingGroup = forumGroupRepository.findById(id);
        if (existingGroup.isPresent()) {
            ForumGroup group = existingGroup.get();
            group.setName(groupDetails.getName());
            group.setDescription(groupDetails.getDescription());
            group.setCategory(groupDetails.getCategory());
            group.setPrivate(groupDetails.isPrivate());
            group.setTags(groupDetails.getTags());
            group.setLastActivity(LocalDateTime.now());
            return forumGroupRepository.save(group);
        }
        return null;
    }
    
    public void deleteGroup(String id) {
        forumGroupRepository.deleteById(id);
    }
    
    // Forum Thread Methods
    public List<ForumThread> getAllThreads() {
        return forumThreadRepository.findAll();
    }
    
    public Optional<ForumThread> getThreadById(String id) {
        return forumThreadRepository.findById(id);
    }
    
    public List<ForumThread> getThreadsByGroupId(String groupId) {
        return forumThreadRepository.findByGroupId(groupId);
    }
    
    public ForumThread createThread(ForumThread thread) {
        thread.setCreatedAt(LocalDateTime.now());
        thread.setUpdatedAt(LocalDateTime.now());
        ForumThread savedThread = forumThreadRepository.save(thread);
        
        // Update group thread count
        if (thread.getGroupId() != null && !thread.getGroupId().isEmpty()) {
            Optional<ForumGroup> group = forumGroupRepository.findById(thread.getGroupId());
            if (group.isPresent()) {
                ForumGroup forumGroup = group.get();
                forumGroup.setThreadCount(forumGroup.getThreadCount() + 1);
                forumGroup.setLastActivity(LocalDateTime.now());
                forumGroupRepository.save(forumGroup);
            }
        }
        
        // Update user reputation: +10 points for creating thread
        updateUserReputation(thread.getAuthorId(), 10, "thread_created");
        
        return savedThread;
    }
    
    public ForumThread updateThread(String id, ForumThread threadDetails) {
        Optional<ForumThread> existingThread = forumThreadRepository.findById(id);
        if (existingThread.isPresent()) {
            ForumThread thread = existingThread.get();
            thread.setTitle(threadDetails.getTitle());
            thread.setContent(threadDetails.getContent());
            thread.setTags(threadDetails.getTags());
            thread.setUpdatedAt(LocalDateTime.now());
            return forumThreadRepository.save(thread);
        }
        return null;
    }
    
    public void deleteThread(String id) {
        Optional<ForumThread> thread = forumThreadRepository.findById(id);
        if (thread.isPresent()) {
            // Update group thread count
            String groupId = thread.get().getGroupId();
            Optional<ForumGroup> group = forumGroupRepository.findById(groupId);
            if (group.isPresent()) {
                ForumGroup forumGroup = group.get();
                forumGroup.setThreadCount(Math.max(0, forumGroup.getThreadCount() - 1));
                forumGroupRepository.save(forumGroup);
            }
        }
        forumThreadRepository.deleteById(id);
    }
    
    public void incrementThreadViews(String threadId) {
        Optional<ForumThread> thread = forumThreadRepository.findById(threadId);
        if (thread.isPresent()) {
            ForumThread forumThread = thread.get();
            forumThread.setViewCount(forumThread.getViewCount() + 1);
            forumThreadRepository.save(forumThread);
        }
    }
    
    // ============= THREAD REPLY METHODS =============
    
    public List<ThreadReply> getThreadReplies(String threadId) {
        return threadReplyRepository.findByThreadId(threadId);
    }
    
    public ThreadReply createReply(ThreadReply reply) {
        reply.setCreatedAt(LocalDateTime.now());
        ThreadReply savedReply = threadReplyRepository.save(reply);
        
        // Update thread reply count
        Optional<ForumThread> thread = forumThreadRepository.findById(reply.getThreadId());
        if (thread.isPresent()) {
            ForumThread forumThread = thread.get();
            forumThread.setReplyCount(forumThread.getReplyCount() + 1);
            forumThread.setUpdatedAt(LocalDateTime.now());
            forumThread.setLastReplyAuthor(reply.getAuthorName());
            forumThread.setLastReplyTimestamp(LocalDateTime.now());
            forumThreadRepository.save(forumThread);
        }
        
        // Update user reputation: +5 points for reply
        updateUserReputation(reply.getAuthorId(), 5, "reply_posted");
        
        return savedReply;
    }
    
    public ThreadReply upvoteReply(String replyId, String userId) {
        Optional<ThreadReply> reply = threadReplyRepository.findById(replyId);
        if (reply.isPresent()) {
            ThreadReply threadReply = reply.get();
            if (!threadReply.getUpvotedBy().contains(userId)) {
                threadReply.getUpvotedBy().add(userId);
                threadReply.setUpvotes(threadReply.getUpvotes() + 1);
                
                // Update author reputation: +2 points per upvote
                updateUserReputation(threadReply.getAuthorId(), 2, "upvote_received");
                
                return threadReplyRepository.save(threadReply);
            }
        }
        return null;
    }
    
    // ============= GROUP MEMBERSHIP METHODS =============
    
    public GroupMember joinGroup(String groupId, String userId, String userName) {
        // Check if already member
        Optional<GroupMember> existing = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(userId);
        member.setUserName(userName);
        GroupMember saved = groupMemberRepository.save(member);
        
        // Update group member count
        Optional<ForumGroup> group = forumGroupRepository.findById(groupId);
        if (group.isPresent()) {
            ForumGroup forumGroup = group.get();
            forumGroup.setMemberCount(groupMemberRepository.countByGroupId(groupId));
            forumGroupRepository.save(forumGroup);
        }
        
        return saved;
    }
    
    public void leaveGroup(String groupId, String userId) {
        groupMemberRepository.deleteByGroupIdAndUserId(groupId, userId);
        
        // Update group member count
        Optional<ForumGroup> group = forumGroupRepository.findById(groupId);
        if (group.isPresent()) {
            ForumGroup forumGroup = group.get();
            forumGroup.setMemberCount(Math.max(0, groupMemberRepository.countByGroupId(groupId)));
            forumGroupRepository.save(forumGroup);
        }
    }
    
    public List<GroupMember> getGroupMembers(String groupId) {
        return groupMemberRepository.findByGroupId(groupId);
    }
    
    public List<GroupMember> getUserGroups(String userId) {
        return groupMemberRepository.findByUserId(userId);
    }
    
    // ============= REPUTATION METHODS =============
    
    public UserReputation getUserReputation(String userId) {
        return userReputationRepository.findByUserId(userId)
            .orElseGet(() -> {
                UserReputation newRep = new UserReputation(userId);
                return userReputationRepository.save(newRep);
            });
    }
    
    private void updateUserReputation(String userId, int points, String action) {
        UserReputation reputation = getUserReputation(userId);
        reputation.setTotalReputation(reputation.getTotalReputation() + points);
        
        switch (action) {
            case "thread_created":
                reputation.setThreadsCreated(reputation.getThreadsCreated() + 1);
                break;
            case "reply_posted":
                reputation.setRepliesPosted(reputation.getRepliesPosted() + 1);
                break;
            case "upvote_received":
                reputation.setUpvotesReceived(reputation.getUpvotesReceived() + 1);
                break;
            case "answer_accepted":
                reputation.setAcceptedAnswers(reputation.getAcceptedAnswers() + 1);
                break;
        }
        
        reputation.setLastUpdated(LocalDateTime.now());
        userReputationRepository.save(reputation);
    }
    
    public int getUserPostsCount(String userId) {
        // Count threads created by user
        long threadsCount = forumThreadRepository.findAll().stream()
            .filter(thread -> thread.getAuthorId().equals(userId))
            .count();
        
        // Count replies posted by user
        long repliesCount = threadReplyRepository.findAll().stream()
            .filter(reply -> reply.getAuthorId().equals(userId))
            .count();
        
        return (int) (threadsCount + repliesCount);
    }
}
