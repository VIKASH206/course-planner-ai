package com.courseplanner.util;

import com.courseplanner.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * One-time cleanup utility to delete all courses from user_courses collection
 * Run this once, then comment out @Component annotation
 * 
 * ⚠️ DISABLED: This was causing courses to be deleted on every server restart!
 * To enable temporarily, uncomment @Component below
 */
// @Component
public class CleanupUserCoursesRunner implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🗑️ Starting user_courses cleanup...");
        
        long count = courseRepository.count();
        System.out.println("📊 Found " + count + " documents in user_courses collection");
        
        if (count > 0) {
            courseRepository.deleteAll();
            System.out.println("✅ Deleted all " + count + " documents from user_courses");
        } else {
            System.out.println("✅ user_courses collection is already empty");
        }
        
        System.out.println("🎉 Cleanup completed!");
    }
}
