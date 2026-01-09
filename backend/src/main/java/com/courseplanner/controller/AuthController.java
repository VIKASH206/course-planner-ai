package com.courseplanner.controller;

import com.courseplanner.dto.ApiResponse;
import com.courseplanner.dto.GoogleAuthRequest;
import com.courseplanner.dto.LoginRequest;
import com.courseplanner.dto.LoginResponse;
import com.courseplanner.dto.PasswordResetRequest;
import com.courseplanner.dto.PasswordResetResponse;
import com.courseplanner.model.User;
import com.courseplanner.security.CustomUserDetailsService;
import com.courseplanner.service.EmailService;
import com.courseplanner.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Collection;
import java.util.Collections;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Authentication Controller
 * Handles login and logout with role-based responses
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private com.courseplanner.service.UserService userService;

    /**
     * POST /api/auth/login
     * Authenticates user and returns role information
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Create session
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            // Load user details
            User user = userDetailsService.loadUserEntity(loginRequest.getEmail());

            // Extract roles
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            String role = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .findFirst()
                .orElse("STUDENT");

            // Build response
            LoginResponse response = new LoginResponse();
            response.setSuccess(true);
            response.setMessage("Login successful");
            response.setUserId(user.getId());
            response.setEmail(user.getEmail());
            response.setUsername(user.getUsername());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setRole(role);
            response.setProfilePicture(user.getProfilePicture());
            response.setSessionId(session.getId());

            return ResponseEntity.ok(ApiResponse.success("Login successful", response));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    /**
     * POST /api/auth/logout
     * Logs out user and invalidates session
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }
            SecurityContextHolder.clearContext();

            return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Logout failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/auth/current-user
     * Returns currently authenticated user information
     */
    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<LoginResponse>> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Not authenticated"));
            }

            String email = authentication.getName();
            User user = userDetailsService.loadUserEntity(email);

            String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .findFirst()
                .orElse("STUDENT");

            LoginResponse response = new LoginResponse();
            response.setSuccess(true);
            response.setUserId(user.getId());
            response.setEmail(user.getEmail());
            response.setUsername(user.getUsername());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setRole(role);
            response.setProfilePicture(user.getProfilePicture());

            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get current user: " + e.getMessage()));
        }
    }

    /**
     * POST /api/auth/forgot-password
     * Initiates password reset process by checking if email exists in database
     * If email exists, sends reset link (placeholder for now)
     * If email doesn't exist, returns error asking user to signup first
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<PasswordResetResponse>> forgotPassword(@RequestBody PasswordResetRequest request) {
        try {
            logger.info("========== PASSWORD RESET REQUEST ==========");
            logger.info("Raw email from request: '{}'", request.getEmail());
            
            // Validate email is provided
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                logger.warn("Password reset failed: Email is empty");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required"));
            }

            // Normalize email - trim and convert to lowercase
            String email = request.getEmail().trim().toLowerCase();
            logger.info("Normalized email: '{}'", email);

            // Try multiple methods to find the user
            logger.info("Attempting to find user...");
            
            // Method 1: Exact match (case-sensitive)
            Optional<User> userByExactEmail = userRepository.findByEmail(email);
            logger.info("Method 1 - findByEmail('{}'):  {}", email, userByExactEmail.isPresent() ? "FOUND" : "NOT FOUND");
            
            // Method 2: Case-insensitive search
            Optional<User> userByCaseInsensitive = userRepository.findByEmailIgnoreCase(email);
            logger.info("Method 2 - findByEmailIgnoreCase('{}'): {}", email, userByCaseInsensitive.isPresent() ? "FOUND" : "NOT FOUND");
            
            // Method 3: Check existence with exact match
            boolean existsExact = userRepository.existsByEmail(email);
            logger.info("Method 3 - existsByEmail('{}'): {}", email, existsExact);
            
            // Method 4: Check existence with case-insensitive
            boolean existsCaseInsensitive = userRepository.existsByEmailIgnoreCase(email);
            logger.info("Method 4 - existsByEmailIgnoreCase('{}'): {}", email, existsCaseInsensitive);

            // Determine if user exists
            Optional<User> foundUser = userByExactEmail.isPresent() ? userByExactEmail : userByCaseInsensitive;
            
            if (foundUser.isPresent()) {
                logger.info("✓ USER FOUND! Email in DB: '{}'", foundUser.get().getEmail());
                
                User user = foundUser.get();
                
                // Generate a secure reset token
                String resetToken = generateResetToken(user.getEmail());
                logger.info("Generated reset token for: {}", user.getEmail());
                
                // Store token in database with 1 hour expiry
                user.setResetToken(resetToken);
                user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
                userRepository.save(user);
                logger.info("Reset token saved in database with 1 hour expiry");
                
                // Send password reset email (will be mocked if email not configured)
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
                logger.info("✅ Password reset process completed for: {}", user.getEmail());
                
                PasswordResetResponse response = new PasswordResetResponse(
                    true, 
                    "Password reset link has been sent to your email.", 
                    true
                );
                
                return ResponseEntity.ok(ApiResponse.success("Password reset link sent successfully", response));
            } else {
                // Email not found - user needs to signup first
                logger.warn("✗ USER NOT FOUND with email: '{}'", email);
                logger.warn("All search methods failed. User must signup first.");
                
                PasswordResetResponse response = new PasswordResetResponse(
                    false, 
                    "Email not found. Please signup first.", 
                    false
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Email not found. Please signup first."));
            }

        } catch (Exception e) {
            logger.error("✗ ERROR processing password reset: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process password reset: " + e.getMessage()));
        }
    }

    /**
     * Generate a simple reset token
     * In production, use UUID and store in database with expiry time
     */
    private String generateResetToken(String email) {
        // Simple token for demo - In production, use secure token generation
        return java.util.UUID.randomUUID().toString();
    }
    
    /**
     * Reset Password
     * POST /api/auth/reset-password
     * Validates token and updates password in database
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@RequestBody PasswordResetRequest request) {
        try {
            String token = request.getToken();
            String newPassword = request.getNewPassword();
            
            logger.info("🔐 Processing password reset with token: {}", token);
            
            // Validate token and new password
            if (token == null || token.trim().isEmpty()) {
                logger.warn("✗ Invalid token: Token is empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid reset token"));
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                logger.warn("✗ Invalid password: Password is empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Password cannot be empty"));
            }
            
            // Find user by reset token
            Optional<User> userOptional = userRepository.findByResetToken(token);
            
            if (!userOptional.isPresent()) {
                logger.warn("✗ Invalid token: No user found with this token");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid or expired reset token"));
            }
            
            User user = userOptional.get();
            
            // Check if token has expired
            if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
                logger.warn("✗ Token expired for user: {}", user.getEmail());
                // Clear expired token
                user.setResetToken(null);
                user.setResetTokenExpiry(null);
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Reset token has expired. Please request a new one."));
            }
            
            // Update password
            user.setPassword(newPassword);
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            
            logger.info("✅ Password reset successful for user: {}", user.getEmail());
            
            return ResponseEntity.ok(ApiResponse.success("Password reset successful. You can now login with your new password.", null));
            
        } catch (Exception e) {
            logger.error("✗ ERROR during password reset: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to reset password: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/auth/google
     * Authenticates user with Google OAuth
     * Creates new user if not exists, or logs in existing user
     */
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> googleLogin(@RequestBody GoogleAuthRequest googleAuthRequest, HttpServletRequest request) {
        try {
            logger.info("🔐 Google OAuth login attempt for email: {}", googleAuthRequest.getEmail());
            
            // Validate Google auth request
            if (googleAuthRequest.getEmail() == null || googleAuthRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required for Google authentication"));
            }
            
            if (googleAuthRequest.getGoogleId() == null || googleAuthRequest.getGoogleId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Google ID is required"));
            }
            
            String email = googleAuthRequest.getEmail().trim().toLowerCase();
            String googleId = googleAuthRequest.getGoogleId();
            
            // Check if user exists by email or Google ID
            Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email);
            User user;
            
            if (existingUser.isPresent()) {
                // User exists - update Google info if not set
                user = existingUser.get();
                logger.info("✓ Existing user found: {}", user.getEmail());
                
                // Update Google ID if not set
                if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
                    user.setGoogleId(googleId);
                    user.setAuthProvider("GOOGLE");
                    logger.info("Updated existing user with Google OAuth info");
                }
                
                // OAuth users are automatically verified
                if (!user.isEmailVerified()) {
                    user.setEmailVerified(true);
                }
                
                // Update profile picture if provided and not already set
                if (googleAuthRequest.getProfilePicture() != null && 
                    !googleAuthRequest.getProfilePicture().isEmpty() &&
                    (user.getProfilePicture() == null || user.getProfilePicture().isEmpty())) {
                    user.setProfilePicture(googleAuthRequest.getProfilePicture());
                }
                
                user.setLastLogin(java.time.LocalDateTime.now());
                userRepository.save(user);
                
            } else {
                // Create new user from Google profile
                logger.info("✓ Creating new user from Google profile");
                user = new User();
                user.setEmail(email);
                user.setGoogleId(googleId);
                user.setAuthProvider("GOOGLE");
                user.setFirstName(googleAuthRequest.getFirstName());
                user.setLastName(googleAuthRequest.getLastName());
                user.setProfilePicture(googleAuthRequest.getProfilePicture());
                user.setRole("STUDENT"); // Default role
                user.setOnboardingCompleted(false); // New users need onboarding
                
                // OAuth users are automatically verified
                user.setEmailVerified(true);
                
                // Generate username from email
                String username = email.split("@")[0];
                // Check if username exists and make it unique if needed
                int counter = 1;
                String originalUsername = username;
                while (userRepository.findByUsername(username).isPresent()) {
                    username = originalUsername + counter;
                    counter++;
                }
                user.setUsername(username);
                
                // No password needed for OAuth users
                user.setPassword(""); 
                
                user.setCreatedAt(java.time.LocalDateTime.now());
                user.setLastLogin(java.time.LocalDateTime.now());
                
                user = userRepository.save(user);
                logger.info("✅ New Google user created: {}", user.getEmail());
            }
            
            // Create authentication token for Spring Security
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Create session
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            
            // Build response
            LoginResponse response = new LoginResponse();
            response.setSuccess(true);
            response.setMessage("Google login successful");
            response.setUserId(user.getId());
            response.setEmail(user.getEmail());
            response.setUsername(user.getUsername());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setRole(user.getRole());
            response.setProfilePicture(user.getProfilePicture());
            response.setSessionId(session.getId());
            
            logger.info("✅ Google OAuth login successful for: {}", user.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Google login successful", response));
            
        } catch (Exception e) {
            logger.error("✗ ERROR during Google OAuth login: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Google login failed: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/auth/verify-email
     * Verify email with token
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(
            @RequestParam String email,
            @RequestParam String token) {
        try {
            logger.info("Email verification request for: {}", email);
            
            User user = userService.verifyEmail(email, token);
            
            logger.info("✅ Email verified successfully for: {}", email);
            return ResponseEntity.ok(ApiResponse.success(
                "Email verified successfully! You can now login.",
                "Email verified"
            ));
            
        } catch (RuntimeException e) {
            logger.error("✗ Email verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("✗ ERROR during email verification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Email verification failed: " + e.getMessage()));
        }
    }
    
    /**
     * POST /api/auth/resend-verification
     * Resend verification email
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<String>> resendVerificationEmail(@RequestParam String email) {
        try {
            logger.info("Resend verification email request for: {}", email);
            
            userService.resendVerificationEmail(email);
            
            logger.info("✅ Verification email resent successfully to: {}", email);
            return ResponseEntity.ok(ApiResponse.success(
                "Verification email sent! Please check your inbox.",
                "Email sent"
            ));
            
        } catch (RuntimeException e) {
            logger.error("✗ Resend verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("✗ ERROR during resend verification: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send verification email: " + e.getMessage()));
        }
    }
}
