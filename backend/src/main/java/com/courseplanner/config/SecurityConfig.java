package com.courseplanner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security Configuration
 * Implements role-based access control without JWT
 * Uses session-based authentication
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS Configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF - Disabled for REST API
            .csrf(csrf -> csrf.disable())
            
            // Session Management - Stateful for simple authentication
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .maximumSessions(1)
            )
            
            // Authorization Rules
            .authorizeHttpRequests(auth -> auth
                // Health check endpoints - MUST be first for monitoring (UptimeRobot, etc.)
                .requestMatchers("/", "/health", "/health/**", "/api/health", "/api/health/**").permitAll()
                
                // Public endpoints - No authentication required
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/api/users/**").permitAll()  // UserController endpoints
                .requestMatchers("/api/courses/**").permitAll()  // Browse courses - public access
                .requestMatchers("/api/enrollments/**").permitAll()  // Allow enrollment operations
                .requestMatchers("/api/tasks", "/api/tasks/**").permitAll()  // Allow task operations (both with and without trailing slash)
                .requestMatchers("/api/forum/**").permitAll()  // Allow forum operations
                .requestMatchers("/api/ai/**").permitAll()  // Allow AI chat and recommendations
                
                // Admin endpoints - Allow all for development (remove authentication requirement)
                .requestMatchers("/admin/**").permitAll()  // Allow all admin endpoints for development
                
                // Student endpoints - Require STUDENT role
                .requestMatchers("/student/**").hasRole("STUDENT")
                
                // All other requests - Allow for development
                .anyRequest().permitAll()
            )
            
            // Disable HTTP Basic Authentication popup
            .httpBasic(basic -> basic.disable())
            
            // Form Login
            .formLogin(form -> form.disable())
            
            // Logout Configuration
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(200);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Logout successful\"}");
                })
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow localhost and IP address access for multi-device support
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "http://192.168.*:*",
            "http://10.*:*",
            "https://course-planner-ai-sigma.vercel.app",
            "https://*.vercel.app",
            "*"  // Allow all origins for health checks and public endpoints
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);  // Disabled to allow wildcard origins
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    @SuppressWarnings("deprecation")
    public PasswordEncoder passwordEncoder() {
        // Using NoOpPasswordEncoder for plain text passwords
        // WARNING: This is NOT secure and should only be used for development/testing
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
