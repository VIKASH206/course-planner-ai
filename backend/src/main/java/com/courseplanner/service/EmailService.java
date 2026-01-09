package com.courseplanner.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

/**
 * Email Service for sending password reset emails
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@courseplanner.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Value("${spring.mail.enabled:false}")
    private boolean emailEnabled;

    /**
     * Send password reset email with reset link
     * @param toEmail Recipient email address
     * @param resetToken Password reset token (for now, placeholder)
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            logger.info("Preparing to send password reset email to: {}", toEmail);

            // Check if email is enabled and configured
            if (mailSender == null || !emailEnabled) {
                logger.warn("⚠️ Email service not configured. Skipping email send.");
                logger.info("📧 Mock Email: Password reset link would be sent to: {}", toEmail);
                logger.info("🔗 Reset Link: {}/auth/reset-password?token={}&email={}", frontendUrl, resetToken, toEmail);
                return; // Skip actual email sending
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password - Course Planner AI");

            // Create HTML email content
            String htmlContent = buildPasswordResetEmailHtml(toEmail, resetToken);
            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(mimeMessage);
            logger.info("✅ Password reset email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("❌ Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
            // Don't throw exception - just log it
            logger.warn("Email sending failed but continuing. Configure email settings to enable email functionality.");
        }
    }

    /**
     * Build HTML email content for password reset
     * Using inline styles for maximum email client compatibility
     */
    private String buildPasswordResetEmailHtml(String email, String resetToken) {
        String resetLink = frontendUrl + "/auth/reset-password?token=" + resetToken + "&email=" + email;

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("</head>");
        html.append("<body style=\"font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;\">");
        
        // Container
        html.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f4f4f4; padding: 20px 0;\">");
        html.append("<tr><td align=\"center\">");
        
        // Main content table
        html.append("<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\">");
        
        // Header with gradient background
        html.append("<tr>");
        html.append("<td style=\"background-color: #667eea; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;\">");
        html.append("<div style=\"font-size: 48px; margin-bottom: 10px; line-height: 1;\">🔐</div>");
        html.append("<h1 style=\"color: #ffffff !important; margin: 0; font-size: 28px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;\">Course Planner AI</h1>");
        html.append("</td>");
        html.append("</tr>");
        
        // Content
        html.append("<tr>");
        html.append("<td style=\"padding: 40px 30px;\">");
        html.append("<h2 style=\"color: #667eea; margin-top: 0; font-size: 24px;\">Reset Your Password</h2>");
        html.append("<p style=\"margin: 15px 0;\">Hello,</p>");
        html.append("<p style=\"margin: 15px 0;\">We received a request to reset the password for your Course Planner AI account associated with <strong>").append(email).append("</strong>.</p>");
        html.append("<p style=\"margin: 15px 0;\">Click the button below to reset your password:</p>");
        
        // Reset button with table for better compatibility
        html.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 30px 0;\">");
        html.append("<tr><td align=\"center\">");
        html.append("<a href=\"").append(resetLink).append("\" style=\"display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;\">Reset Password</a>");
        html.append("</td></tr>");
        html.append("</table>");
        
        html.append("<p style=\"margin: 15px 0;\">Or copy and paste this link into your browser:</p>");
        html.append("<p style=\"word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 4px; font-size: 12px; color: #666;\">").append(resetLink).append("</p>");
        
        // Warning box
        html.append("<div style=\"background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;\">");
        html.append("<p style=\"margin: 0 0 10px 0;\"><strong>⚠️ Important:</strong></p>");
        html.append("<ul style=\"margin: 5px 0; padding-left: 20px;\">");
        html.append("<li>This link will expire in 1 hour</li>");
        html.append("<li>If you didn't request this, please ignore this email</li>");
        html.append("<li>Your password won't change until you create a new one</li>");
        html.append("</ul>");
        html.append("</div>");
        
        html.append("</td>");
        html.append("</tr>");
        
        // Footer
        html.append("<tr>");
        html.append("<td style=\"background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;\">");
        html.append("<p style=\"margin: 5px 0;\">© 2026 Course Planner AI. All rights reserved.</p>");
        html.append("<p style=\"margin: 5px 0;\">This is an automated email. Please do not reply.</p>");
        html.append("</td>");
        html.append("</tr>");
        
        html.append("</table>");
        html.append("</td></tr>");
        html.append("</table>");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }

    /**
     * Send simple text email (fallback)
     */
    public void sendSimpleEmail(String toEmail, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(text);
            
            mailSender.send(message);
            logger.info("Simple email sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send simple email: {}", e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
    
    /**
     * Send email verification link after signup
     * @param toEmail Recipient email address
     * @param verificationToken Email verification token
     */
    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            logger.info("Preparing to send verification email to: {}", toEmail);

            // Check if email is enabled and configured
            if (mailSender == null || !emailEnabled) {
                logger.warn("⚠️ Email service not configured. Skipping email send.");
                logger.info("📧 Mock Email: Verification link would be sent to: {}", toEmail);
                logger.info("🔗 Verification Link: {}/auth/verify-email?token={}&email={}", frontendUrl, verificationToken, toEmail);
                return; // Skip actual email sending
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email - Course Planner AI");

            // Create HTML email content
            String htmlContent = buildVerificationEmailHtml(toEmail, verificationToken);
            helper.setText(htmlContent, true);

            // Send email
            mailSender.send(mimeMessage);
            logger.info("✅ Verification email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            logger.error("❌ Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
            logger.warn("Email sending failed but continuing. Configure email settings to enable email functionality.");
        }
    }
    
    /**
     * Build HTML email content for email verification
     */
    private String buildVerificationEmailHtml(String email, String verificationToken) {
        String verificationLink = frontendUrl + "/auth/verify-email?token=" + verificationToken + "&email=" + email;

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">");
        html.append("</head>");
        html.append("<body style=\"font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;\">");
        
        // Container
        html.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #f4f4f4; padding: 20px 0;\">");
        html.append("<tr><td align=\"center\">");
        
        // Main content table
        html.append("<table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" style=\"background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);\">");
        
        // Header with gradient background
        html.append("<tr>");
        html.append("<td style=\"background-color: #667eea; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;\">");
        html.append("<div style=\"font-size: 48px; margin-bottom: 10px; line-height: 1;\">✉️</div>");
        html.append("<h1 style=\"color: #ffffff !important; margin: 0; font-size: 28px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;\">Course Planner AI</h1>");
        html.append("</td>");
        html.append("</tr>");
        
        // Content
        html.append("<tr>");
        html.append("<td style=\"padding: 40px 30px;\">");
        html.append("<h2 style=\"color: #667eea; margin-top: 0; font-size: 24px;\">Verify Your Email</h2>");
        html.append("<p style=\"margin: 15px 0;\">Hello,</p>");
        html.append("<p style=\"margin: 15px 0;\">Welcome to Course Planner AI! 🎉</p>");
        html.append("<p style=\"margin: 15px 0;\">Please verify your email address <strong>").append(email).append("</strong> to activate your account and start learning.</p>");
        
        // Verification button
        html.append("<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin: 30px 0;\">");
        html.append("<tr><td align=\"center\">");
        html.append("<a href=\"").append(verificationLink).append("\" style=\"display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;\">Verify Email Address</a>");
        html.append("</td></tr>");
        html.append("</table>");
        
        html.append("<p style=\"margin: 15px 0;\">Or copy and paste this link into your browser:</p>");
        html.append("<p style=\"word-break: break-all; background-color: #f8f9fa; padding: 15px; border-radius: 4px; font-size: 12px; color: #666;\">").append(verificationLink).append("</p>");
        
        // Info box
        html.append("<div style=\"background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px;\">");
        html.append("<p style=\"margin: 0 0 10px 0;\"><strong>ℹ️ Important:</strong></p>");
        html.append("<ul style=\"margin: 5px 0; padding-left: 20px;\">");
        html.append("<li>This link will expire in 24 hours</li>");
        html.append("<li>You must verify your email to login</li>");
        html.append("<li>If you didn't create an account, please ignore this email</li>");
        html.append("</ul>");
        html.append("</div>");
        
        html.append("</td>");
        html.append("</tr>");
        
        // Footer
        html.append("<tr>");
        html.append("<td style=\"background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;\">");
        html.append("<p style=\"margin: 5px 0;\">© 2026 Course Planner AI. All rights reserved.</p>");
        html.append("<p style=\"margin: 5px 0;\">This is an automated email. Please do not reply.</p>");
        html.append("</td>");
        html.append("</tr>");
        
        html.append("</table>");
        html.append("</td></tr>");
        html.append("</table>");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}

