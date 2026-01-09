package com.courseplanner.controller;

import com.courseplanner.model.User;
import com.courseplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * TEMPORARY Controller to reset passwords to plain text
 * DELETE THIS CONTROLLER IN PRODUCTION
 */
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class PasswordResetController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        user.setPassword(newPassword);
        userRepository.save(user);
        
        return ResponseEntity.ok("Password reset successfully for " + email);
    }
    
    @PostMapping("/reset-all-passwords")
    public ResponseEntity<String> resetAllPasswords() {
        // Reset admin password
        Optional<User> adminOpt = userRepository.findByEmail("admin@courseplanner.com");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setPassword("Admin@123");
            userRepository.save(admin);
        }
        
        // Reset vikash password
        Optional<User> vikashOpt = userRepository.findByEmail("vikash@33gmail.com");
        if (vikashOpt.isPresent()) {
            User vikash = vikashOpt.get();
            vikash.setPassword("Vikash@206");
            userRepository.save(vikash);
        }
        
        return ResponseEntity.ok("All passwords reset to plain text!");
    }
}
