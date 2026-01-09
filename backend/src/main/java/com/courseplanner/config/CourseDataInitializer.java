package com.courseplanner.config;

import com.courseplanner.model.BrowseCourse;
import com.courseplanner.repository.BrowseCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class CourseDataInitializer implements CommandLineRunner {

    @Autowired
    private BrowseCourseRepository browseCourseRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if courses already exist
        long count = browseCourseRepository.count();
        if (count > 0) {
            System.out.println("✅ Database already has " + count + " courses. Skipping initialization.");
            return;
        }

        System.out.println("🔄 Initializing database with sample courses...");

        List<BrowseCourse> sampleCourses = Arrays.asList(
            createCourse(
                "Introduction to Python Programming",
                "Learn Python from scratch with hands-on projects and real-world examples. Perfect for beginners!",
                "Programming",
                "Beginner",
                40, // 40 hours duration
                4.5,
                1250,
                "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Python", "Programming", "Beginner"),
                "Dr. Sarah Johnson",
                true, // isFeatured
                false // isTrending
            ),
            createCourse(
                "Advanced Java Spring Boot",
                "Master Spring Boot framework with microservices architecture and cloud deployment",
                "Programming",
                "Advanced",
                60,
                4.7,
                890,
                "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Java", "Spring Boot", "Microservices"),
                "Prof. Michael Chen",
                true,
                true
            ),
            createCourse(
                "Machine Learning Fundamentals",
                "Dive into AI and ML with practical examples using Python, TensorFlow, and scikit-learn",
                "AI & ML",
                "Intermediate",
                70,
                4.8,
                2150,
                "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Machine Learning", "AI", "Python", "TensorFlow"),
                "Dr. Emily Rodriguez",
                true,
                true
            ),
            createCourse(
                "Web Development Bootcamp",
                "Full-stack web development with HTML, CSS, JavaScript, React, Node.js, and MongoDB",
                "Web Development",
                "Beginner",
                80,
                4.6,
                3200,
                "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Web Development", "React", "Node.js", "JavaScript"),
                "John Smith",
                true,
                false
            ),
            createCourse(
                "Data Science with R",
                "Statistical analysis and data visualization using R programming and RStudio",
                "Data Science",
                "Intermediate",
                50,
                4.4,
                670,
                "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Data Science", "R", "Statistics"),
                "Dr. Amanda Lee",
                false,
                false
            ),
            createCourse(
                "Cloud Computing with AWS",
                "Learn Amazon Web Services - EC2, S3, Lambda, RDS, and cloud architecture best practices",
                "Cloud Computing",
                "Intermediate",
                45,
                4.7,
                1450,
                "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("AWS", "Cloud", "DevOps"),
                "Mark Thompson",
                true,
                true
            ),
            createCourse(
                "Mobile App Development with Flutter",
                "Build beautiful cross-platform mobile apps for iOS and Android using Flutter and Dart",
                "Mobile Development",
                "Intermediate",
                65,
                4.5,
                980,
                "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Flutter", "Mobile", "Dart", "iOS", "Android"),
                "Lisa Wang",
                false,
                true
            ),
            createCourse(
                "Cybersecurity Essentials",
                "Network security, ethical hacking, penetration testing, and security best practices",
                "Security",
                "Advanced",
                55,
                4.8,
                1120,
                "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Cybersecurity", "Hacking", "Security"),
                "Robert Martinez",
                true,
                false
            ),
            createCourse(
                "Digital Marketing Masterclass",
                "SEO, social media marketing, content marketing, analytics, and conversion optimization",
                "Marketing",
                "Beginner",
                35,
                4.3,
                2340,
                "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Marketing", "SEO", "Social Media"),
                "Jennifer Brown",
                false,
                false
            ),
            createCourse(
                "Blockchain Development",
                "Smart contracts, Ethereum, Solidity, DApps, and cryptocurrency fundamentals",
                "Blockchain",
                "Advanced",
                70,
                4.6,
                560,
                "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Blockchain", "Ethereum", "Solidity", "Crypto"),
                "David Kim",
                true,
                true
            ),
            createCourse(
                "UI/UX Design Principles",
                "User interface design, user experience, Figma, prototyping, and design thinking",
                "Design",
                "Beginner",
                30,
                4.7,
                1870,
                "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("UI", "UX", "Design", "Figma"),
                "Sophie Anderson",
                true,
                false
            ),
            createCourse(
                "DevOps Engineering",
                "CI/CD, Docker, Kubernetes, Jenkins, monitoring, and infrastructure as code",
                "DevOps",
                "Advanced",
                60,
                4.8,
                890,
                "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("DevOps", "Docker", "Kubernetes", "CI/CD"),
                "Chris Wilson",
                true,
                true
            ),
            createCourse(
                "SQL Database Management",
                "Database design, SQL queries, optimization, MySQL, PostgreSQL, and database administration",
                "Database",
                "Intermediate",
                40,
                4.5,
                1340,
                "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("SQL", "Database", "MySQL", "PostgreSQL"),
                "Dr. James Taylor",
                false,
                false
            ),
            createCourse(
                "React Native Mobile Apps",
                "Build native mobile applications using React Native and JavaScript",
                "Mobile Development",
                "Intermediate",
                55,
                4.6,
                1120,
                "https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("React Native", "Mobile", "JavaScript"),
                "Karen Martinez",
                false,
                false
            ),
            createCourse(
                "Artificial Intelligence Fundamentals",
                "Introduction to AI, neural networks, deep learning, and practical AI applications",
                "AI & ML",
                "Intermediate",
                70,
                4.9,
                2890,
                "https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("AI", "Neural Networks", "Deep Learning"),
                "Dr. Alan Turing",
                true,
                true
            ),
            createCourse(
                "Game Development with Unity",
                "Create 2D and 3D games using Unity engine and C# programming",
                "Game Development",
                "Beginner",
                80,
                4.4,
                1560,
                "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Unity", "Game Development", "C#"),
                "Alex Johnson",
                false,
                false
            ),
            createCourse(
                "Angular Web Applications",
                "Build modern single-page applications with Angular framework and TypeScript",
                "Web Development",
                "Intermediate",
                50,
                4.5,
                890,
                "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Angular", "TypeScript", "Web Development"),
                "Patricia Garcia",
                false,
                false
            ),
            createCourse(
                "Python for Data Analysis",
                "Data manipulation with Pandas, NumPy, visualization with Matplotlib and Seaborn",
                "Data Science",
                "Beginner",
                40,
                4.6,
                1780,
                "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Python", "Data Analysis", "Pandas", "NumPy"),
                "Dr. Rachel Green",
                true,
                false
            ),
            createCourse(
                "Kubernetes Container Orchestration",
                "Deploy and manage containerized applications at scale with Kubernetes",
                "Cloud Computing",
                "Advanced",
                55,
                4.7,
                670,
                "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("Kubernetes", "Containers", "DevOps"),
                "Thomas Anderson",
                true,
                false
            ),
            createCourse(
                "iOS Development with Swift",
                "Build native iOS apps using Swift and Xcode for iPhone and iPad",
                "Mobile Development",
                "Intermediate",
                65,
                4.8,
                1230,
                "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800",
                Arrays.asList("iOS", "Swift", "Xcode", "Mobile"),
                "Steve Cook",
                false,
                true
            )
        );

        browseCourseRepository.saveAll(sampleCourses);
        System.out.println("✅ Successfully inserted " + sampleCourses.size() + " sample courses into MongoDB!");
    }

    private BrowseCourse createCourse(String title, String description, String category, 
                                      String level, int durationHours, double rating, 
                                      int studentsCount, String imageUrl, List<String> tags,
                                      String instructor, boolean isFeatured, boolean isTrending) {
        BrowseCourse course = new BrowseCourse();
        course.setTitle(title);
        course.setDescription(description);
        course.setCategory(category);
        course.setDifficulty(level);
        course.setLevel(level);
        course.setDuration(durationHours);
        course.setRating(rating);
        course.setStudentsCount(studentsCount);
        course.setImageUrl(imageUrl);
        course.setTags(tags);
        course.setInstructor(instructor);
        course.setFeatured(isFeatured);
        course.setTrending(isTrending);
        course.setPublished(true);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        return course;
    }
}
