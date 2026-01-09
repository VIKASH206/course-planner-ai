package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.model.*;
import com.courseplanner.service.ForumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/forum")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"}, allowCredentials = "true")
public class ForumController {

    @Autowired
    private ForumService forumService;

    // ============= FORUM GROUP ENDPOINTS =============
    
    /**
     * Get all forum groups
     */
    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<List<ForumGroup>>> getAllGroups() {
        try {
            List<ForumGroup> groups = forumService.getAllGroups();
            return ResponseEntity.ok(ApiResponse.success("Forum groups retrieved successfully", groups));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving forum groups: " + e.getMessage()));
        }
    }
    
    /**
     * Get forum group by ID
     */
    @GetMapping("/groups/{id}")
    public ResponseEntity<ApiResponse<ForumGroup>> getGroupById(@PathVariable String id) {
        try {
            Optional<ForumGroup> group = forumService.getGroupById(id);
            if (group.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("Forum group retrieved successfully", group.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving forum group: " + e.getMessage()));
        }
    }
    
    /**
     * Get forum groups by category
     */
    @GetMapping("/groups/category/{category}")
    public ResponseEntity<ApiResponse<List<ForumGroup>>> getGroupsByCategory(@PathVariable String category) {
        try {
            List<ForumGroup> groups = forumService.getGroupsByCategory(category);
            return ResponseEntity.ok(ApiResponse.success("Forum groups retrieved successfully", groups));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving forum groups: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new forum group
     */
    @PostMapping("/groups")
    public ResponseEntity<ApiResponse<ForumGroup>> createGroup(@RequestBody ForumGroup group) {
        try {
            System.out.println("📝 Creating forum group: " + group.getName());
            ForumGroup createdGroup = forumService.createGroup(group);
            return ResponseEntity.ok(ApiResponse.success("Forum group created successfully", createdGroup));
        } catch (Exception e) {
            System.err.println("❌ Error creating forum group: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error creating forum group: " + e.getMessage()));
        }
    }
    
    /**
     * Update a forum group
     */
    @PutMapping("/groups/{id}")
    public ResponseEntity<ApiResponse<ForumGroup>> updateGroup(@PathVariable String id, @RequestBody ForumGroup group) {
        try {
            ForumGroup updatedGroup = forumService.updateGroup(id, group);
            if (updatedGroup != null) {
                return ResponseEntity.ok(ApiResponse.success("Forum group updated successfully", updatedGroup));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error updating forum group: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a forum group
     */
    @DeleteMapping("/groups/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable String id) {
        try {
            forumService.deleteGroup(id);
            return ResponseEntity.ok(ApiResponse.success("Forum group deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error deleting forum group: " + e.getMessage()));
        }
    }
    
    // ============= FORUM THREAD ENDPOINTS =============
    
    /**
     * Get all forum threads
     */
    @GetMapping("/threads")
    public ResponseEntity<ApiResponse<List<ForumThread>>> getAllThreads() {
        try {
            List<ForumThread> threads = forumService.getAllThreads();
            return ResponseEntity.ok(ApiResponse.success("Forum threads retrieved successfully", threads));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving forum threads: " + e.getMessage()));
        }
    }
    
    /**
     * Get forum thread by ID
     */
    @GetMapping("/threads/{id}")
    public ResponseEntity<ApiResponse<ForumThread>> getThreadById(@PathVariable String id) {
        try {
            Optional<ForumThread> thread = forumService.getThreadById(id);
            if (thread.isPresent()) {
                // Increment view count
                forumService.incrementThreadViews(id);
                return ResponseEntity.ok(ApiResponse.success("Forum thread retrieved successfully", thread.get()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving forum thread: " + e.getMessage()));
        }
    }
    
    /**
     * Get forum threads by group ID
     */
    @GetMapping("/threads/group/{groupId}")
    public ResponseEntity<ApiResponse<List<ForumThread>>> getThreadsByGroupId(@PathVariable String groupId) {
        try {
            List<ForumThread> threads = forumService.getThreadsByGroupId(groupId);
            return ResponseEntity.ok(ApiResponse.success("Forum threads retrieved successfully", threads));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving forum threads: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new forum thread
     */
    @PostMapping("/threads")
    public ResponseEntity<ApiResponse<ForumThread>> createThread(@RequestBody ForumThread thread) {
        try {
            System.out.println("📝 Creating forum thread: " + thread.getTitle());
            ForumThread createdThread = forumService.createThread(thread);
            return ResponseEntity.ok(ApiResponse.success("Forum thread created successfully", createdThread));
        } catch (Exception e) {
            System.err.println("❌ Error creating forum thread: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error creating forum thread: " + e.getMessage()));
        }
    }
    
    /**
     * Update a forum thread
     */
    @PutMapping("/threads/{id}")
    public ResponseEntity<ApiResponse<ForumThread>> updateThread(@PathVariable String id, @RequestBody ForumThread thread) {
        try {
            ForumThread updatedThread = forumService.updateThread(id, thread);
            if (updatedThread != null) {
                return ResponseEntity.ok(ApiResponse.success("Forum thread updated successfully", updatedThread));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error updating forum thread: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a forum thread
     */
    @DeleteMapping("/threads/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteThread(@PathVariable String id) {
        try {
            forumService.deleteThread(id);
            return ResponseEntity.ok(ApiResponse.success("Forum thread deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error deleting forum thread: " + e.getMessage()));
        }
    }
    
    /**
     * Increment thread view count
     */
    @PostMapping("/threads/{id}/view")
    public ResponseEntity<ApiResponse<Void>> incrementThreadViews(@PathVariable String id) {
        try {
            forumService.incrementThreadViews(id);
            return ResponseEntity.ok(ApiResponse.success("Thread view count incremented", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error incrementing view count: " + e.getMessage()));
        }
    }
    
    // ============= THREAD REPLY ENDPOINTS =============
    
    /**
     * Get replies for a thread
     */
    @GetMapping("/threads/{threadId}/replies")
    public ResponseEntity<ApiResponse<List<ThreadReply>>> getThreadReplies(@PathVariable String threadId) {
        try {
            List<ThreadReply> replies = forumService.getThreadReplies(threadId);
            return ResponseEntity.ok(ApiResponse.success("Replies retrieved successfully", replies));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving replies: " + e.getMessage()));
        }
    }
    
    /**
     * Create a reply to a thread
     */
    @PostMapping("/threads/{threadId}/replies")
    public ResponseEntity<ApiResponse<ThreadReply>> createReply(@PathVariable String threadId, @RequestBody ThreadReply reply) {
        try {
            reply.setThreadId(threadId);
            ThreadReply createdReply = forumService.createReply(reply);
            return ResponseEntity.ok(ApiResponse.success("Reply created successfully", createdReply));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error creating reply: " + e.getMessage()));
        }
    }
    
    /**
     * Upvote a reply
     */
    @PostMapping("/replies/{replyId}/upvote")
    public ResponseEntity<ApiResponse<ThreadReply>> upvoteReply(@PathVariable String replyId, @RequestBody Map<String, String> payload) {
        try {
            String userId = payload.get("userId");
            ThreadReply reply = forumService.upvoteReply(replyId, userId);
            if (reply != null) {
                return ResponseEntity.ok(ApiResponse.success("Reply upvoted successfully", reply));
            }
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Already upvoted or reply not found"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error upvoting reply: " + e.getMessage()));
        }
    }
    
    // ============= GROUP MEMBERSHIP ENDPOINTS =============
    
    /**
     * Join a group
     */
    @PostMapping("/groups/{groupId}/join")
    public ResponseEntity<ApiResponse<GroupMember>> joinGroup(@PathVariable String groupId, @RequestBody Map<String, String> payload) {
        try {
            String userId = payload.get("userId");
            String userName = payload.getOrDefault("userName", "User");
            GroupMember member = forumService.joinGroup(groupId, userId, userName);
            return ResponseEntity.ok(ApiResponse.success("Joined group successfully", member));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error joining group: " + e.getMessage()));
        }
    }
    
    /**
     * Leave a group
     */
    @PostMapping("/groups/{groupId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroup(@PathVariable String groupId, @RequestBody Map<String, String> payload) {
        try {
            String userId = payload.get("userId");
            forumService.leaveGroup(groupId, userId);
            return ResponseEntity.ok(ApiResponse.success("Left group successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error leaving group: " + e.getMessage()));
        }
    }
    
    /**
     * Get group members
     */
    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<ApiResponse<List<GroupMember>>> getGroupMembers(@PathVariable String groupId) {
        try {
            List<GroupMember> members = forumService.getGroupMembers(groupId);
            return ResponseEntity.ok(ApiResponse.success("Group members retrieved successfully", members));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving group members: " + e.getMessage()));
        }
    }
    
    /**
     * Get user's groups
     */
    @GetMapping("/users/{userId}/groups")
    public ResponseEntity<ApiResponse<List<GroupMember>>> getUserGroups(@PathVariable String userId) {
        try {
            List<GroupMember> groups = forumService.getUserGroups(userId);
            return ResponseEntity.ok(ApiResponse.success("User groups retrieved successfully", groups));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving user groups: " + e.getMessage()));
        }
    }
    
    // ============= REPUTATION ENDPOINTS =============
    
    /**
     * Get user reputation
     */
    @GetMapping("/users/{userId}/reputation")
    public ResponseEntity<ApiResponse<UserReputation>> getUserReputation(@PathVariable String userId) {
        try {
            UserReputation reputation = forumService.getUserReputation(userId);
            return ResponseEntity.ok(ApiResponse.success("User reputation retrieved successfully", reputation));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving user reputation: " + e.getMessage()));
        }
    }
    
    /**
     * Get user posts count (threads + replies)
     */
    @GetMapping("/users/{userId}/posts/count")
    public ResponseEntity<ApiResponse<Integer>> getUserPostsCount(@PathVariable String userId) {
        try {
            int postsCount = forumService.getUserPostsCount(userId);
            return ResponseEntity.ok(ApiResponse.success("User posts count retrieved successfully", postsCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error retrieving user posts count: " + e.getMessage()));
        }
    }
}
