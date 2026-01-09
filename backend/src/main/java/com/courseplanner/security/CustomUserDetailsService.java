package com.courseplanner.security;

import com.courseplanner.model.User;
import com.courseplanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetailsService implementation for Spring Security
 * Loads user from MongoDB and converts to Spring Security UserDetails
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find user by email first, then by username
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Check if email is verified (except for OAuth users)
        if (!user.isEmailVerified() && (user.getAuthProvider() == null || user.getAuthProvider().equals("LOCAL"))) {
            throw new UsernameNotFoundException("Email not verified. Please check your email for verification link.");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(), // Plain text password (as per requirements)
                getAuthorities(user)
        );
    }

    /**
     * Convert user role to Spring Security GrantedAuthority
     * Role must be prefixed with "ROLE_" for Spring Security
     */
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        String role = user.getRole();
        if (role != null && !role.isEmpty()) {
            // Add ROLE_ prefix if not already present
            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }
            authorities.add(new SimpleGrantedAuthority(role));
        } else {
            // Default to STUDENT role
            authorities.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
        }
        
        return authorities;
    }

    /**
     * Load user entity directly (for additional user info)
     */
    public User loadUserEntity(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .or(() -> userRepository.findByUsername(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
