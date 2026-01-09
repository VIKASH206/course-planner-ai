package com.courseplanner.config;

import com.courseplanner.model.Interest;
import com.courseplanner.model.Goal;
import com.courseplanner.model.Subject;
import com.courseplanner.repository.InterestRepository;
import com.courseplanner.repository.GoalRepository;
import com.courseplanner.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Initializes sample admin data on application startup
 * Runs after AdminUserInitializer to ensure admin user exists first
 */
@Component
@Order(2) // Run after AdminUserInitializer
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private InterestRepository interestRepository;
    
    @Autowired
    private GoalRepository goalRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeInterests();
        initializeGoals();
        initializeSubjects();
    }

    private void initializeInterests() {
        if (interestRepository.count() == 0) {
            System.out.println("\n🎯 Seeding Interests...");
            
            Interest int1 = new Interest();
            int1.setName("Technology and Programming");
            int1.setDescription("Software development, coding, and tech skills");
            int1.setEnabled(true);
            int1.setOrderIndex(1);
            int1.setCreatedAt(LocalDateTime.now());
            interestRepository.save(int1);
            
            Interest int2 = new Interest();
            int2.setName("Data Science and AI");
            int2.setDescription("Machine learning, data analysis, and artificial intelligence");
            int2.setEnabled(true);
            int2.setOrderIndex(2);
            int2.setCreatedAt(LocalDateTime.now());
            interestRepository.save(int2);
            
            Interest int3 = new Interest();
            int3.setName("Business and Management");
            int3.setDescription("Business strategy, management, and entrepreneurship");
            int3.setEnabled(true);
            int3.setOrderIndex(3);
            int3.setCreatedAt(LocalDateTime.now());
            interestRepository.save(int3);
            
            Interest int4 = new Interest();
            int4.setName("Creative Arts and Design");
            int4.setDescription("Graphic design, UI/UX, and creative expression");
            int4.setEnabled(true);
            int4.setOrderIndex(4);
            int4.setCreatedAt(LocalDateTime.now());
            interestRepository.save(int4);
            
            System.out.println("✅ Created 4 Interests");
        } else {
            System.out.println("✅ Interests already exist: " + interestRepository.count());
        }
    }

    private void initializeGoals() {
        if (goalRepository.count() == 0) {
            System.out.println("\n🎯 Seeding Goals...");
            
            List<Interest> interests = interestRepository.findAll();
            
            if (interests.size() >= 3) {
                Goal goal1 = new Goal();
                goal1.setName("Get a Job");
                goal1.setDescription("Prepare for career opportunities in tech industry");
                goal1.setInterestIds(Arrays.asList(interests.get(0).getId(), interests.get(1).getId()));
                goal1.setEnabled(true);
                goal1.setOrderIndex(1);
                goal1.setCreatedAt(LocalDateTime.now());
                goalRepository.save(goal1);
                
                Goal goal2 = new Goal();
                goal2.setName("Start a Business");
                goal2.setDescription("Learn entrepreneurship and start your own venture");
                goal2.setInterestIds(Arrays.asList(interests.get(2).getId()));
                goal2.setEnabled(true);
                goal2.setOrderIndex(2);
                goal2.setCreatedAt(LocalDateTime.now());
                goalRepository.save(goal2);
                
                Goal goal3 = new Goal();
                goal3.setName("Career Advancement");
                goal3.setDescription("Upgrade skills and advance in current career");
                goal3.setInterestIds(Arrays.asList(interests.get(0).getId(), interests.get(1).getId(), interests.get(2).getId()));
                goal3.setEnabled(true);
                goal3.setOrderIndex(3);
                goal3.setCreatedAt(LocalDateTime.now());
                goalRepository.save(goal3);
                
                Goal goal4 = new Goal();
                goal4.setName("Personal Growth");
                goal4.setDescription("Learn for personal development and hobbies");
                goal4.setInterestIds(Arrays.asList(interests.get(3).getId()));
                goal4.setEnabled(true);
                goal4.setOrderIndex(4);
                goal4.setCreatedAt(LocalDateTime.now());
                goalRepository.save(goal4);
                
                System.out.println("✅ Created 4 Goals");
            }
        } else {
            System.out.println("✅ Goals already exist: " + goalRepository.count());
        }
    }

    private void initializeSubjects() {
        if (subjectRepository.count() == 0) {
            System.out.println("\n🎯 Seeding Subjects...");
            
            List<Interest> interests = interestRepository.findAll();
            List<Goal> goals = goalRepository.findAll();
            
            if (interests.size() >= 2 && goals.size() >= 2) {
                Subject sub1 = new Subject();
                sub1.setName("Python Programming");
                sub1.setDescription("Learn Python from scratch - variables, loops, functions, and OOP");
                sub1.setInterestId(interests.get(0).getId());
                sub1.setGoalId(goals.get(0).getId());
                sub1.setDifficultyLevel("Beginner");
                sub1.setDurationWeeks(8);
                sub1.setRoadmapOrder(1);
                sub1.setEnabled(true);
                sub1.setCreatedAt(LocalDateTime.now());
                subjectRepository.save(sub1);
                
                Subject sub2 = new Subject();
                sub2.setName("Web Development Fundamentals");
                sub2.setDescription("HTML, CSS, and JavaScript basics for building websites");
                sub2.setInterestId(interests.get(0).getId());
                sub2.setGoalId(goals.get(0).getId());
                sub2.setDifficultyLevel("Beginner");
                sub2.setDurationWeeks(10);
                sub2.setRoadmapOrder(2);
                sub2.setEnabled(true);
                sub2.setCreatedAt(LocalDateTime.now());
                subjectRepository.save(sub2);
                
                Subject sub3 = new Subject();
                sub3.setName("Data Structures and Algorithms");
                sub3.setDescription("Master DSA concepts for coding interviews");
                sub3.setInterestId(interests.get(0).getId());
                sub3.setGoalId(goals.get(0).getId());
                sub3.setDifficultyLevel("Intermediate");
                sub3.setDurationWeeks(12);
                sub3.setRoadmapOrder(3);
                sub3.setEnabled(true);
                sub3.setCreatedAt(LocalDateTime.now());
                subjectRepository.save(sub3);
                
                Subject sub4 = new Subject();
                sub4.setName("Machine Learning Basics");
                sub4.setDescription("Introduction to ML concepts, algorithms, and Python libraries");
                sub4.setInterestId(interests.get(1).getId());
                sub4.setGoalId(goals.get(0).getId());
                sub4.setDifficultyLevel("Intermediate");
                sub4.setDurationWeeks(10);
                sub4.setRoadmapOrder(4);
                sub4.setEnabled(true);
                sub4.setCreatedAt(LocalDateTime.now());
                subjectRepository.save(sub4);
                
                Subject sub5 = new Subject();
                sub5.setName("Business Strategy");
                sub5.setDescription("Strategic planning, market analysis, and execution");
                sub5.setInterestId(interests.get(2).getId());
                sub5.setGoalId(goals.get(1).getId());
                sub5.setDifficultyLevel("Beginner");
                sub5.setDurationWeeks(6);
                sub5.setRoadmapOrder(1);
                sub5.setEnabled(true);
                sub5.setCreatedAt(LocalDateTime.now());
                subjectRepository.save(sub5);
                
                System.out.println("✅ Created 5 Subjects");
            }
        } else {
            System.out.println("✅ Subjects already exist: " + subjectRepository.count());
        }
    }
}
