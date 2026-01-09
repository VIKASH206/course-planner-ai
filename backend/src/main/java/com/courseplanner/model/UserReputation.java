package com.courseplanner.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "user_reputation")
public class UserReputation {
    @Id
    private String id;
    private String userId;
    private int totalReputation;
    private int threadsCreated;
    private int repliesPosted;
    private int upvotesReceived;
    private int acceptedAnswers;
    private LocalDateTime lastUpdated;
    
    public UserReputation() {
        this.totalReputation = 0;
        this.threadsCreated = 0;
        this.repliesPosted = 0;
        this.upvotesReceived = 0;
        this.acceptedAnswers = 0;
        this.lastUpdated = LocalDateTime.now();
    }
    
    public UserReputation(String userId) {
        this();
        this.userId = userId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public int getTotalReputation() { return totalReputation; }
    public void setTotalReputation(int totalReputation) { this.totalReputation = totalReputation; }
    
    public int getThreadsCreated() { return threadsCreated; }
    public void setThreadsCreated(int threadsCreated) { this.threadsCreated = threadsCreated; }
    
    public int getRepliesPosted() { return repliesPosted; }
    public void setRepliesPosted(int repliesPosted) { this.repliesPosted = repliesPosted; }
    
    public int getUpvotesReceived() { return upvotesReceived; }
    public void setUpvotesReceived(int upvotesReceived) { this.upvotesReceived = upvotesReceived; }
    
    public int getAcceptedAnswers() { return acceptedAnswers; }
    public void setAcceptedAnswers(int acceptedAnswers) { this.acceptedAnswers = acceptedAnswers; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
