package com.courseplanner.repository;

import com.courseplanner.model.CourseContent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseContentRepository extends MongoRepository<CourseContent, String> {
    Optional<CourseContent> findByCourseId(String courseId);
    boolean existsByCourseId(String courseId);
    void deleteByCourseId(String courseId);
}
