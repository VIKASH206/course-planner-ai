package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "thread_replies")
public class ThreadReply {
    @Id
    private String id;
    private String threadId;
    private String content;
    private String authorId;
    private String authorName;
    private String authorAvatar;
    private String authorRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int upvotes;
    private List<String> upvotedBy; // User IDs who upvoted
    private boolean isAccepted; // For marking best answer
    private String parentReplyId; // For nested replies
    
    public ThreadReply() {
        this.upvotedBy = new ArrayList<>();
        this.upvotes = 0;
        this.isAccepted = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getThreadId() { return threadId; }
    public void setThreadId(String threadId) { this.threadId = threadId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    
    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }
    
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public int getUpvotes() { return upvotes; }
    public void setUpvotes(int upvotes) { this.upvotes = upvotes; }
    
    public List<String> getUpvotedBy() { return upvotedBy; }
    public void setUpvotedBy(List<String> upvotedBy) { this.upvotedBy = upvotedBy; }
    
    public boolean isAccepted() { return isAccepted; }
    public void setAccepted(boolean isAccepted) { this.isAccepted = isAccepted; }
    
    public String getParentReplyId() { return parentReplyId; }
    public void setParentReplyId(String parentReplyId) { this.parentReplyId = parentReplyId; }
}
