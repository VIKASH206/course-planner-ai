package com.courseplanner.repository;

import com.courseplanner.model.PlatformSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatformSettingsRepository extends MongoRepository<PlatformSettings, String> {
    // Find the single platform settings document (there should only be one)
    PlatformSettings findFirstByOrderByUpdatedAtDesc();
}
