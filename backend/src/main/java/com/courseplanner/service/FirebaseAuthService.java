package com.courseplanner.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class FirebaseAuthService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthService.class);

    @Value("${firebase.service-account-json:}")
    private String serviceAccountJson;

    @Value("${firebase.project-id:}")
    private String firebaseProjectId;

    @Value("${firebase.web-api-key:}")
    private String firebaseWebApiKey;

    private volatile boolean initialized = false;

    private final WebClient webClient = WebClient.builder().build();

    public static class VerifiedFirebaseUser {
        private final String uid;
        private final String email;
        private final String name;
        private final String picture;
        private final boolean emailVerified;

        public VerifiedFirebaseUser(String uid, String email, String name, String picture, boolean emailVerified) {
            this.uid = uid;
            this.email = email;
            this.name = name;
            this.picture = picture;
            this.emailVerified = emailVerified;
        }

        public String getUid() {
            return uid;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public String getPicture() {
            return picture;
        }

        public boolean isEmailVerified() {
            return emailVerified;
        }
    }

    public VerifiedFirebaseUser verifyIdToken(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Firebase ID token is required");
        }

        // Preferred: verify with Firebase Admin SDK when service account JSON is available.
        if (serviceAccountJson != null && !serviceAccountJson.trim().isEmpty()) {
            try {
                ensureInitialized();
                FirebaseToken token = FirebaseAuth.getInstance().verifyIdToken(idToken);
                return new VerifiedFirebaseUser(
                        token.getUid(),
                        token.getEmail(),
                        token.getName(),
                        token.getPicture(),
                        Boolean.TRUE.equals(token.isEmailVerified())
                );
            } catch (FirebaseAuthException ex) {
                throw new IllegalArgumentException("Invalid or expired Firebase token", ex);
            } catch (IllegalStateException ex) {
                logger.warn("Firebase Admin SDK initialization failed. Falling back to Identity Toolkit verification.", ex);
            }
        }

        // Fallback: verify idToken via Firebase Identity Toolkit using Web API key.
        return verifyViaIdentityToolkit(idToken);
    }

    private VerifiedFirebaseUser verifyViaIdentityToolkit(String idToken) {
        if (firebaseWebApiKey == null || firebaseWebApiKey.trim().isEmpty()) {
            throw new IllegalStateException(
                    "Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_WEB_API_KEY."
            );
        }

        try {
            String url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + firebaseWebApiKey.trim();
            JsonNode response = webClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of("idToken", idToken))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            JsonNode user = response != null && response.path("users").isArray() && !response.path("users").isEmpty()
                    ? response.path("users").get(0)
                    : null;

            if (user == null) {
                throw new IllegalArgumentException("Invalid or expired Firebase token");
            }

            return new VerifiedFirebaseUser(
                    user.path("localId").asText(""),
                    user.path("email").asText(""),
                    user.path("displayName").asText(""),
                    user.path("photoUrl").asText(""),
                    user.path("emailVerified").asBoolean(false)
            );
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid or expired Firebase token", ex);
        }
    }

    private synchronized void ensureInitialized() {
        if (initialized) {
            return;
        }

        if (!FirebaseApp.getApps().isEmpty()) {
            initialized = true;
            return;
        }

        if (serviceAccountJson == null || serviceAccountJson.trim().isEmpty()) {
            throw new IllegalStateException("Firebase is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON.");
        }

        try {
            InputStream credentialsStream = new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
            FirebaseOptions.Builder builder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(credentialsStream));

            if (firebaseProjectId != null && !firebaseProjectId.trim().isEmpty()) {
                builder.setProjectId(firebaseProjectId.trim());
            }

            FirebaseApp.initializeApp(builder.build());
            initialized = true;
            logger.info("Firebase Admin SDK initialized for Google authentication");
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to initialize Firebase Admin SDK", ex);
        }
    }
}
