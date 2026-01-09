package com.courseplanner.util;

import com.courseplanner.model.BrowseCourse;
import com.courseplanner.repository.BrowseCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Database seeder for Browse Courses
 * Populates the database with sample courses for testing
 * 
 * ⚠️ DISABLED: This was causing courses to be deleted and reseeded on every server restart!
 * To enable temporarily for initial seeding, uncomment @Component below
 */
// @Component
public class BrowseCourseSeeder implements CommandLineRunner {

    @Autowired
    private BrowseCourseRepository browseCourseRepository;

    @Override
    public void run(String... args) throws Exception {
        // TEMPORARY: Delete all existing courses and reseed
        long existingCount = browseCourseRepository.count();
        if (existingCount > 0) {
            System.out.println("🗑️ Deleting " + existingCount + " existing courses...");
            browseCourseRepository.deleteAll();
            System.out.println("✅ Deleted all existing courses!");
        }

        System.out.println("🌱 Seeding browse courses database...");

        List<BrowseCourse> courses = createSampleCourses();
        browseCourseRepository.saveAll(courses);

        System.out.println("✅ Successfully seeded " + courses.size() + " courses!");
    }

    private List<BrowseCourse> createSampleCourses() {
        return Arrays.asList(
            // AI & Machine Learning Courses
            createCourse(
                "Introduction to Artificial Intelligence",
                "Learn the fundamentals of AI, including machine learning, neural networks, and deep learning basics.",
                "Artificial Intelligence",
                "Beginner",
                "Dr. Sarah Johnson",
                40,
                Arrays.asList("AI", "Machine Learning", "Neural Networks", "Deep Learning"),
                4.8,
                3500,
                true,
                true
            ),
            createCourse(
                "Advanced Machine Learning",
                "Master advanced ML algorithms, ensemble methods, and real-world applications.",
                "Artificial Intelligence",
                "Advanced",
                "Prof. Michael Chen",
                60,
                Arrays.asList("Machine Learning", "AI", "Algorithms", "Data Science"),
                4.9,
                2100,
                true,
                false
            ),
            createCourse(
                "Deep Learning Specialization",
                "Comprehensive deep learning course covering CNNs, RNNs, GANs, and transformers.",
                "Artificial Intelligence",
                "Expert",
                "Dr. Emily Watson",
                80,
                Arrays.asList("Deep Learning", "Neural Networks", "AI", "TensorFlow"),
                4.7,
                1800,
                false,
                false
            ),

            // Web Development Courses
            createCourse(
                "Full Stack Web Development",
                "Build modern web applications using React, Node.js, Express, and MongoDB.",
                "Web Development",
                "Intermediate",
                "John Smith",
                50,
                Arrays.asList("React", "Node.js", "MongoDB", "JavaScript", "Full Stack"),
                4.6,
                5200,
                true,
                true
            ),
            createCourse(
                "HTML & CSS for Beginners",
                "Start your web development journey with HTML5 and CSS3 fundamentals.",
                "Web Development",
                "Beginner",
                "Jane Doe",
                20,
                Arrays.asList("HTML", "CSS", "Web Design", "Frontend"),
                4.5,
                8500,
                false,
                false
            ),
            createCourse(
                "Advanced JavaScript Programming",
                "Master ES6+, async programming, functional programming, and design patterns.",
                "Web Development",
                "Advanced",
                "Robert Brown",
                45,
                Arrays.asList("JavaScript", "ES6", "Programming", "Frontend"),
                4.8,
                3200,
                true,
                false
            ),

            // Python Programming
            createCourse(
                "Python for Beginners",
                "Complete Python programming course from basics to intermediate level.",
                "Programming",
                "Beginner",
                "Lisa Anderson",
                35,
                Arrays.asList("Python", "Programming", "Coding", "Basics"),
                4.7,
                12000,
                true,
                true
            ),
            createCourse(
                "Python for Data Science",
                "Learn Python libraries for data science: NumPy, Pandas, Matplotlib, and Scikit-learn.",
                "Data Science",
                "Intermediate",
                "Dr. David Lee",
                55,
                Arrays.asList("Python", "Data Science", "Pandas", "NumPy", "Machine Learning"),
                4.9,
                6500,
                true,
                true
            ),
            createCourse(
                "Advanced Python: Mastery Course",
                "Deep dive into Python internals, decorators, metaclasses, and async programming.",
                "Programming",
                "Expert",
                "Mark Wilson",
                70,
                Arrays.asList("Python", "Advanced Programming", "Software Engineering"),
                4.6,
                1500,
                false,
                false
            ),

            // Data Science & Analytics
            createCourse(
                "Data Science Fundamentals",
                "Introduction to data science, statistics, and data visualization.",
                "Data Science",
                "Beginner",
                "Dr. Jennifer Martinez",
                40,
                Arrays.asList("Data Science", "Statistics", "Visualization", "Analytics"),
                4.7,
                4800,
                true,
                false
            ),
            createCourse(
                "Big Data Analytics",
                "Learn Hadoop, Spark, and big data processing techniques.",
                "Data Science",
                "Advanced",
                "Prof. Thomas Garcia",
                65,
                Arrays.asList("Big Data", "Hadoop", "Spark", "Analytics"),
                4.5,
                2300,
                false,
                false
            ),

            // Mobile Development
            createCourse(
                "Android App Development",
                "Build native Android apps using Kotlin and Jetpack Compose.",
                "Mobile Development",
                "Intermediate",
                "Alex Rodriguez",
                50,
                Arrays.asList("Android", "Kotlin", "Mobile Development", "App Development"),
                4.6,
                3900,
                true,
                false
            ),
            createCourse(
                "iOS Development with Swift",
                "Create iOS apps using Swift and SwiftUI framework.",
                "Mobile Development",
                "Intermediate",
                "Rachel Green",
                55,
                Arrays.asList("iOS", "Swift", "Mobile Development", "App Development"),
                4.8,
                3100,
                true,
                false
            ),
            createCourse(
                "React Native Mobile Development",
                "Build cross-platform mobile apps with React Native.",
                "Mobile Development",
                "Intermediate",
                "Chris Evans",
                45,
                Arrays.asList("React Native", "Mobile Development", "JavaScript", "Cross-Platform"),
                4.7,
                4200,
                true,
                true
            ),

            // Cloud Computing
            createCourse(
                "AWS Cloud Practitioner",
                "Master AWS fundamentals: EC2, S3, RDS, Lambda, and more.",
                "Cloud Computing",
                "Beginner",
                "Daniel Kim",
                30,
                Arrays.asList("AWS", "Cloud Computing", "DevOps", "Infrastructure"),
                4.8,
                5600,
                true,
                true
            ),
            createCourse(
                "Azure Solutions Architect",
                "Design and implement Microsoft Azure cloud solutions.",
                "Cloud Computing",
                "Advanced",
                "Michelle Taylor",
                60,
                Arrays.asList("Azure", "Cloud Computing", "Architecture", "DevOps"),
                4.6,
                2800,
                false,
                false
            ),

            // Cybersecurity
            createCourse(
                "Cybersecurity Fundamentals",
                "Learn security basics, encryption, network security, and ethical hacking.",
                "Cybersecurity",
                "Beginner",
                "James White",
                35,
                Arrays.asList("Cybersecurity", "Security", "Ethical Hacking", "Network Security"),
                4.7,
                4100,
                true,
                false
            ),
            createCourse(
                "Advanced Penetration Testing",
                "Master penetration testing techniques and tools.",
                "Cybersecurity",
                "Expert",
                "Victoria Adams",
                75,
                Arrays.asList("Penetration Testing", "Cybersecurity", "Security", "Hacking"),
                4.9,
                1200,
                false,
                false
            ),

            // Business & Management
            createCourse(
                "Project Management Professional",
                "Prepare for PMP certification with comprehensive project management training.",
                "Business",
                "Intermediate",
                "Steven Clark",
                40,
                Arrays.asList("Project Management", "PMP", "Business", "Leadership"),
                4.5,
                3400,
                false,
                false
            ),
            createCourse(
                "Digital Marketing Mastery",
                "Complete guide to SEO, SEM, social media marketing, and content strategy.",
                "Marketing",
                "Beginner",
                "Amanda Scott",
                30,
                Arrays.asList("Digital Marketing", "SEO", "Social Media", "Marketing"),
                4.6,
                6200,
                true,
                true
            ),

            // Design
            createCourse(
                "UI/UX Design Fundamentals",
                "Learn user interface and user experience design principles.",
                "Design",
                "Beginner",
                "Olivia Turner",
                35,
                Arrays.asList("UI", "UX", "Design", "User Experience"),
                4.8,
                5100,
                true,
                false
            ),
            createCourse(
                "Graphic Design with Adobe Creative Suite",
                "Master Photoshop, Illustrator, and InDesign for professional design.",
                "Design",
                "Intermediate",
                "Nathan Cooper",
                45,
                Arrays.asList("Graphic Design", "Adobe", "Design", "Creative"),
                4.7,
                3800,
                false,
                false
            ),

            // Additional Courses
            createCourse(
                "Blockchain Development",
                "Build decentralized applications using Ethereum and Solidity.",
                "Blockchain",
                "Advanced",
                "Brian Foster",
                50,
                Arrays.asList("Blockchain", "Ethereum", "Solidity", "Cryptocurrency"),
                4.6,
                2100,
                true,
                true
            ),
            createCourse(
                "DevOps Engineering",
                "Master CI/CD, Docker, Kubernetes, and infrastructure automation.",
                "DevOps",
                "Intermediate",
                "Kevin Wright",
                55,
                Arrays.asList("DevOps", "Docker", "Kubernetes", "CI/CD", "Automation"),
                4.8,
                3700,
                true,
                true
            ),
            createCourse(
                "Natural Language Processing",
                "Learn NLP techniques, transformers, and build chatbots.",
                "Artificial Intelligence",
                "Advanced",
                "Dr. Patricia Hill",
                65,
                Arrays.asList("NLP", "AI", "Machine Learning", "Chatbots"),
                4.7,
                1900,
                false,
                false
            ),
            createCourse(
                "Game Development with Unity",
                "Create 2D and 3D games using Unity game engine and C#.",
                "Game Development",
                "Intermediate",
                "Andrew Lewis",
                60,
                Arrays.asList("Game Development", "Unity", "C#", "Gaming"),
                4.6,
                4500,
                true,
                false
            ),
            createCourse(
                "SQL and Database Design",
                "Master SQL queries, database design, and optimization.",
                "Database Management",
                "Beginner",
                "Sandra Martinez",
                30,
                Arrays.asList("SQL", "Database", "MySQL", "PostgreSQL"),
                4.5,
                7800,
                false,
                false
            ),

            // MORE AI & Machine Learning Courses
            createCourse(
                "Computer Vision with Python",
                "Learn image processing, object detection, and face recognition using OpenCV.",
                "Artificial Intelligence",
                "Intermediate",
                "Dr. Alan Turing",
                45,
                Arrays.asList("AI", "Computer Vision", "OpenCV", "Python", "Machine Learning"),
                4.8,
                2400,
                true,
                false
            ),
            createCourse(
                "Reinforcement Learning",
                "Master Q-learning, policy gradients, and build AI game agents.",
                "Artificial Intelligence",
                "Expert",
                "Prof. Andrew Ng",
                70,
                Arrays.asList("AI", "Reinforcement Learning", "Machine Learning", "Deep Learning"),
                4.9,
                1600,
                true,
                true
            ),

            // MORE Web Development Courses
            createCourse(
                "CSS Advanced Techniques",
                "Master CSS Grid, Flexbox, animations, and responsive design patterns.",
                "Web Development",
                "Intermediate",
                "Emma Wilson",
                25,
                Arrays.asList("CSS", "Web Design", "Frontend", "Responsive Design"),
                4.6,
                4200,
                false,
                false
            ),
            createCourse(
                "JavaScript ES6+ Modern Features",
                "Learn modern JavaScript: arrow functions, promises, async/await, modules.",
                "Web Development",
                "Intermediate",
                "Lucas Garcia",
                30,
                Arrays.asList("JavaScript", "ES6", "Programming", "Web Development"),
                4.7,
                3900,
                true,
                false
            ),
            createCourse(
                "Angular Web Development",
                "Build enterprise applications with Angular framework and TypeScript.",
                "Web Development",
                "Advanced",
                "Sophia Martinez",
                55,
                Arrays.asList("Angular", "TypeScript", "Web Development", "Frontend"),
                4.5,
                2700,
                false,
                false
            ),
            createCourse(
                "Vue.js Complete Guide",
                "Master Vue.js 3, Vuex, Vue Router, and composition API.",
                "Web Development",
                "Intermediate",
                "Oliver Brown",
                40,
                Arrays.asList("Vue.js", "JavaScript", "Web Development", "Frontend"),
                4.8,
                3100,
                true,
                false
            ),

            // MORE Mobile Development Courses
            createCourse(
                "Flutter Mobile Development",
                "Build beautiful cross-platform apps with Flutter and Dart.",
                "Mobile Development",
                "Intermediate",
                "Isabella Davis",
                50,
                Arrays.asList("Flutter", "Dart", "Mobile Development", "Cross-Platform"),
                4.9,
                4600,
                true,
                true
            ),
            createCourse(
                "Progressive Web Apps (PWA)",
                "Create fast, reliable, and engaging web apps that work offline.",
                "Mobile Development",
                "Advanced",
                "Mason Lee",
                35,
                Arrays.asList("PWA", "Web Development", "Mobile Development", "JavaScript"),
                4.6,
                1800,
                false,
                false
            ),

            // MORE Data Science Courses
            createCourse(
                "Data Visualization with Python",
                "Create stunning visualizations with Matplotlib, Seaborn, and Plotly.",
                "Data Science",
                "Beginner",
                "Ava Johnson",
                25,
                Arrays.asList("Data Science", "Python", "Visualization", "Analytics"),
                4.7,
                5300,
                true,
                false
            ),
            createCourse(
                "Time Series Analysis",
                "Master forecasting, ARIMA models, and time series data analysis.",
                "Data Science",
                "Advanced",
                "Ethan Wilson",
                40,
                Arrays.asList("Data Science", "Time Series", "Forecasting", "Statistics"),
                4.5,
                1500,
                false,
                false
            ),

            // MORE Cloud Computing Courses
            createCourse(
                "Google Cloud Platform Fundamentals",
                "Learn GCP services: Compute Engine, Cloud Storage, BigQuery.",
                "Cloud Computing",
                "Beginner",
                "Mia Anderson",
                35,
                Arrays.asList("GCP", "Cloud Computing", "Google Cloud", "DevOps"),
                4.7,
                3800,
                true,
                false
            ),
            createCourse(
                "Kubernetes Complete Guide",
                "Master container orchestration with Kubernetes and Helm.",
                "Cloud Computing",
                "Advanced",
                "Noah Thomas",
                60,
                Arrays.asList("Kubernetes", "DevOps", "Cloud Computing", "Containers"),
                4.8,
                2900,
                true,
                true
            ),

            // MORE Cybersecurity Courses
            createCourse(
                "Network Security Essentials",
                "Learn firewalls, VPNs, IDS/IPS, and network defense strategies.",
                "Cybersecurity",
                "Intermediate",
                "Charlotte White",
                40,
                Arrays.asList("Cybersecurity", "Network Security", "Security", "Networking"),
                4.6,
                2200,
                false,
                false
            ),
            createCourse(
                "Web Application Security",
                "Master OWASP Top 10, SQL injection, XSS, and secure coding practices.",
                "Cybersecurity",
                "Advanced",
                "William Harris",
                50,
                Arrays.asList("Cybersecurity", "Web Security", "OWASP", "Security"),
                4.8,
                1700,
                true,
                false
            ),

            // MORE DevOps Courses
            createCourse(
                "Jenkins CI/CD Pipeline",
                "Build automated deployment pipelines with Jenkins.",
                "DevOps",
                "Intermediate",
                "Amelia Clark",
                30,
                Arrays.asList("DevOps", "Jenkins", "CI/CD", "Automation"),
                4.5,
                2800,
                false,
                false
            ),
            createCourse(
                "Terraform Infrastructure as Code",
                "Automate infrastructure provisioning with Terraform.",
                "DevOps",
                "Advanced",
                "Benjamin Rodriguez",
                45,
                Arrays.asList("DevOps", "Terraform", "Infrastructure", "Cloud Computing"),
                4.7,
                2100,
                true,
                false
            ),

            // MORE Blockchain Courses
            createCourse(
                "Smart Contract Development",
                "Build and deploy smart contracts on Ethereum blockchain.",
                "Blockchain",
                "Advanced",
                "Harper Martinez",
                55,
                Arrays.asList("Blockchain", "Smart Contracts", "Ethereum", "Solidity"),
                4.6,
                1400,
                false,
                false
            ),
            createCourse(
                "Cryptocurrency Trading & Analysis",
                "Learn crypto markets, technical analysis, and trading strategies.",
                "Blockchain",
                "Beginner",
                "Evelyn Garcia",
                20,
                Arrays.asList("Blockchain", "Cryptocurrency", "Trading", "Finance"),
                4.4,
                6100,
                true,
                true
            ),

            // MORE Game Development Courses
            createCourse(
                "Unreal Engine 5 Game Development",
                "Create AAA-quality games with Unreal Engine 5 and Blueprints.",
                "Game Development",
                "Intermediate",
                "Sebastian Walker",
                65,
                Arrays.asList("Game Development", "Unreal Engine", "3D", "Gaming"),
                4.8,
                3200,
                true,
                false
            ),
            createCourse(
                "2D Game Development with Godot",
                "Build indie 2D games using Godot Engine and GDScript.",
                "Game Development",
                "Beginner",
                "Luna Scott",
                35,
                Arrays.asList("Game Development", "Godot", "2D Games", "Indie"),
                4.6,
                2600,
                false,
                false
            ),

            // MORE UI/UX Design Courses
            createCourse(
                "Figma UI Design Masterclass",
                "Design professional interfaces using Figma design tool.",
                "UI/UX Design",
                "Beginner",
                "Scarlett Adams",
                25,
                Arrays.asList("UI", "UX", "Figma", "Design", "Prototyping"),
                4.9,
                5800,
                true,
                true
            ),
            createCourse(
                "User Research & Testing",
                "Master user interviews, usability testing, and research methods.",
                "UI/UX Design",
                "Intermediate",
                "Jack Turner",
                30,
                Arrays.asList("UX", "User Research", "Design", "Testing"),
                4.7,
                2300,
                false,
                false
            ),

            // MORE Database Courses
            createCourse(
                "MongoDB NoSQL Database",
                "Master MongoDB document database and aggregation framework.",
                "Database Management",
                "Intermediate",
                "Grace Mitchell",
                40,
                Arrays.asList("MongoDB", "NoSQL", "Database", "Backend"),
                4.6,
                3400,
                true,
                false
            ),
            createCourse(
                "PostgreSQL Advanced Administration",
                "Master PostgreSQL administration, replication, and optimization.",
                "Database Management",
                "Advanced",
                "Henry Roberts",
                50,
                Arrays.asList("PostgreSQL", "Database", "SQL", "Administration"),
                4.5,
                1600,
                false,
                false
            ),

            // IoT Courses
            createCourse(
                "Internet of Things (IoT) Fundamentals",
                "Build IoT projects with Arduino, Raspberry Pi, and sensors.",
                "IoT",
                "Beginner",
                "Lily Campbell",
                35,
                Arrays.asList("IoT", "Arduino", "Raspberry Pi", "Electronics"),
                4.7,
                3600,
                true,
                false
            ),
            createCourse(
                "Industrial IoT Solutions",
                "Design and deploy enterprise IoT systems and edge computing.",
                "IoT",
                "Advanced",
                "Jackson Parker",
                60,
                Arrays.asList("IoT", "Industrial", "Edge Computing", "Sensors"),
                4.4,
                900,
                false,
                false
            ),

            // AR/VR Courses
            createCourse(
                "Virtual Reality Development",
                "Create immersive VR experiences using Unity and Oculus SDK.",
                "AR/VR",
                "Intermediate",
                "Zoe Evans",
                50,
                Arrays.asList("VR", "Virtual Reality", "Unity", "3D", "Gaming"),
                4.8,
                2100,
                true,
                true
            ),
            createCourse(
                "Augmented Reality with ARKit",
                "Build AR apps for iOS using ARKit and RealityKit.",
                "AR/VR",
                "Advanced",
                "Leo Collins",
                45,
                Arrays.asList("AR", "Augmented Reality", "iOS", "ARKit"),
                4.6,
                1200,
                false,
                false
            ),

            // Network Engineering Courses
            createCourse(
                "CCNA Certification Training",
                "Prepare for Cisco CCNA exam with comprehensive networking training.",
                "Network Engineering",
                "Intermediate",
                "Victoria Stewart",
                70,
                Arrays.asList("Networking", "CCNA", "Cisco", "Network Engineering"),
                4.7,
                4200,
                true,
                false
            ),
            createCourse(
                "Advanced Network Design",
                "Design enterprise networks with routing, switching, and security.",
                "Network Engineering",
                "Advanced",
                "Ryan Morris",
                65,
                Arrays.asList("Network Engineering", "Networking", "Enterprise", "Security"),
                4.5,
                1300,
                false,
                false
            ),
            
            // ============ ADDITIONAL COURSES FOR ALL SUBJECTS ============
            
            // Data Science - 3 Levels
            createCourse(
                "Data Science Fundamentals",
                "Learn data science basics including Python, pandas, numpy, and data visualization.",
                "Data Science",
                "Beginner",
                "Dr. Emily Chen",
                50,
                Arrays.asList("Data Science", "Python", "Pandas", "Data Analysis", "Visualization"),
                4.6,
                8500,
                true,
                true
            ),
            createCourse(
                "Machine Learning for Data Science",
                "Apply machine learning algorithms to real-world data science problems.",
                "Data Science",
                "Intermediate",
                "Prof. Michael Zhang",
                65,
                Arrays.asList("Data Science", "Machine Learning", "Python", "Scikit-learn", "Statistics"),
                4.7,
                6200,
                true,
                false
            ),
            createCourse(
                "Advanced Data Science & Big Data",
                "Master big data technologies including Spark, Hadoop, and advanced ML techniques.",
                "Data Science",
                "Advanced",
                "Dr. Amanda Williams",
                80,
                Arrays.asList("Data Science", "Big Data", "Spark", "Hadoop", "Deep Learning"),
                4.8,
                3400,
                false,
                false
            ),

            // Cloud Computing - 3 Levels
            createCourse(
                "Cloud Computing Essentials",
                "Introduction to cloud platforms including AWS, Azure, and Google Cloud basics.",
                "Cloud Computing",
                "Beginner",
                "James Wilson",
                45,
                Arrays.asList("Cloud Computing", "AWS", "Azure", "Google Cloud", "Basics"),
                4.5,
                7800,
                true,
                false
            ),
            createCourse(
                "AWS Solutions Architect",
                "Design and deploy scalable applications on AWS cloud infrastructure.",
                "Cloud Computing",
                "Intermediate",
                "Sarah Mitchell",
                70,
                Arrays.asList("Cloud Computing", "AWS", "Architecture", "DevOps", "Infrastructure"),
                4.8,
                5600,
                true,
                true
            ),
            createCourse(
                "Multi-Cloud Architecture & Strategy",
                "Master advanced cloud architecture across AWS, Azure, and GCP platforms.",
                "Cloud Computing",
                "Advanced",
                "David Kumar",
                85,
                Arrays.asList("Cloud Computing", "Multi-Cloud", "AWS", "Azure", "GCP", "Enterprise"),
                4.7,
                2900,
                false,
                false
            ),

            // Cybersecurity - 3 Levels
            createCourse(
                "Cybersecurity Fundamentals",
                "Learn security basics including network security, cryptography, and threat detection.",
                "Cybersecurity",
                "Beginner",
                "Robert Hayes",
                55,
                Arrays.asList("Cybersecurity", "Security", "Network Security", "Encryption", "Threats"),
                4.6,
                9200,
                true,
                true
            ),
            createCourse(
                "Ethical Hacking & Penetration Testing",
                "Master ethical hacking techniques and penetration testing methodologies.",
                "Cybersecurity",
                "Intermediate",
                "Jennifer Park",
                75,
                Arrays.asList("Cybersecurity", "Ethical Hacking", "Penetration Testing", "Security", "Kali Linux"),
                4.8,
                5400,
                true,
                false
            ),
            createCourse(
                "Advanced Security Operations",
                "Enterprise security operations, incident response, and threat hunting.",
                "Cybersecurity",
                "Advanced",
                "Marcus Thompson",
                90,
                Arrays.asList("Cybersecurity", "SOC", "Incident Response", "Threat Hunting", "Enterprise Security"),
                4.7,
                2100,
                false,
                false
            ),

            // DevOps - 3 Levels
            createCourse(
                "DevOps Basics for Beginners",
                "Introduction to DevOps culture, tools, and practices including Git and CI/CD.",
                "DevOps",
                "Beginner",
                "Alex Rodriguez",
                48,
                Arrays.asList("DevOps", "Git", "CI/CD", "Docker", "Automation"),
                4.5,
                7600,
                true,
                false
            ),
            createCourse(
                "Kubernetes & Container Orchestration",
                "Master Docker containers and Kubernetes for container orchestration.",
                "DevOps",
                "Intermediate",
                "Lisa Anderson",
                68,
                Arrays.asList("DevOps", "Kubernetes", "Docker", "Containers", "Orchestration"),
                4.8,
                4900,
                true,
                true
            ),
            createCourse(
                "Enterprise DevOps & Site Reliability",
                "Advanced DevOps practices, SRE principles, and infrastructure as code.",
                "DevOps",
                "Advanced",
                "Thomas Lee",
                95,
                Arrays.asList("DevOps", "SRE", "Infrastructure as Code", "Terraform", "Monitoring"),
                4.7,
                1800,
                false,
                false
            ),

            // Blockchain - 3 Levels
            createCourse(
                "Blockchain Technology Basics",
                "Understand blockchain fundamentals, cryptocurrencies, and decentralized systems.",
                "Blockchain",
                "Beginner",
                "Sophia Martinez",
                42,
                Arrays.asList("Blockchain", "Cryptocurrency", "Bitcoin", "Decentralization", "Web3"),
                4.4,
                6800,
                true,
                false
            ),
            createCourse(
                "Smart Contract Development",
                "Build and deploy smart contracts using Solidity and Ethereum.",
                "Blockchain",
                "Intermediate",
                "Daniel Kim",
                72,
                Arrays.asList("Blockchain", "Smart Contracts", "Solidity", "Ethereum", "DApps"),
                4.7,
                3800,
                true,
                false
            ),
            createCourse(
                "Advanced Blockchain Architecture",
                "Design enterprise blockchain solutions and consensus mechanisms.",
                "Blockchain",
                "Advanced",
                "Olivia Brown",
                88,
                Arrays.asList("Blockchain", "Enterprise", "Consensus", "Hyperledger", "Architecture"),
                4.6,
                1500,
                false,
                false
            ),

            // Game Development - 3 Levels
            createCourse(
                "Game Development with Unity",
                "Create your first 2D and 3D games using Unity game engine.",
                "Game Development",
                "Beginner",
                "Kevin Murphy",
                60,
                Arrays.asList("Game Development", "Unity", "C#", "3D", "2D Games"),
                4.6,
                8900,
                true,
                true
            ),
            createCourse(
                "Advanced Unity & Unreal Engine",
                "Master advanced game mechanics, physics, and multiplayer systems.",
                "Game Development",
                "Intermediate",
                "Rachel Green",
                78,
                Arrays.asList("Game Development", "Unity", "Unreal Engine", "Multiplayer", "Physics"),
                4.8,
                4500,
                true,
                false
            ),
            createCourse(
                "AAA Game Development Pipeline",
                "Professional game development workflow used in AAA game studios.",
                "Game Development",
                "Advanced",
                "Nathan Foster",
                100,
                Arrays.asList("Game Development", "AAA Games", "Pipeline", "Optimization", "Professional"),
                4.7,
                1200,
                false,
                false
            ),

            // UI/UX Design - 3 Levels
            createCourse(
                "UI/UX Design Fundamentals",
                "Learn user interface and user experience design principles and best practices.",
                "UI/UX Design",
                "Beginner",
                "Isabella Davis",
                50,
                Arrays.asList("UI/UX Design", "Design", "Figma", "User Experience", "Prototyping"),
                4.7,
                9500,
                true,
                true
            ),
            createCourse(
                "Advanced UI Design with Figma",
                "Create professional UI designs, design systems, and interactive prototypes.",
                "UI/UX Design",
                "Intermediate",
                "Christopher Lee",
                65,
                Arrays.asList("UI/UX Design", "Figma", "Design Systems", "Prototyping", "Advanced"),
                4.8,
                5800,
                true,
                false
            ),
            createCourse(
                "UX Research & Product Design",
                "Master UX research methodologies and strategic product design.",
                "UI/UX Design",
                "Advanced",
                "Emma Wilson",
                75,
                Arrays.asList("UI/UX Design", "UX Research", "Product Design", "User Testing", "Strategy"),
                4.6,
                2400,
                false,
                false
            ),

            // Database Management - 3 Levels
            createCourse(
                "SQL & Database Basics",
                "Learn SQL fundamentals and relational database design principles.",
                "Database Management",
                "Beginner",
                "Andrew Clark",
                45,
                Arrays.asList("Database Management", "SQL", "MySQL", "Database Design", "Queries"),
                4.5,
                10200,
                true,
                true
            ),
            createCourse(
                "Advanced Database Administration",
                "Master database optimization, indexing, and performance tuning.",
                "Database Management",
                "Intermediate",
                "Michelle Turner",
                70,
                Arrays.asList("Database Management", "DBA", "Optimization", "Performance", "PostgreSQL"),
                4.7,
                4200,
                true,
                false
            ),
            createCourse(
                "Enterprise Database Solutions",
                "Design and manage large-scale distributed database systems.",
                "Database Management",
                "Advanced",
                "Steven Harris",
                85,
                Arrays.asList("Database Management", "Distributed Systems", "NoSQL", "Enterprise", "Scalability"),
                4.6,
                1600,
                false,
                false
            ),

            // IoT (Internet of Things) - 3 Levels
            createCourse(
                "IoT Fundamentals with Arduino",
                "Build IoT projects with Arduino, sensors, and basic electronics.",
                "IoT",
                "Beginner",
                "Laura Martinez",
                52,
                Arrays.asList("IoT", "Arduino", "Electronics", "Sensors", "Raspberry Pi"),
                4.6,
                7200,
                true,
                true
            ),
            createCourse(
                "IoT Application Development",
                "Create IoT applications with MQTT, cloud integration, and data analytics.",
                "IoT",
                "Intermediate",
                "Brian Cooper",
                68,
                Arrays.asList("IoT", "MQTT", "Cloud", "Data Analytics", "Applications"),
                4.7,
                3900,
                true,
                false
            ),
            createCourse(
                "Industrial IoT & Edge Computing",
                "Design enterprise IoT solutions with edge computing and AI integration.",
                "IoT",
                "Advanced",
                "Patricia Young",
                92,
                Arrays.asList("IoT", "Industrial IoT", "Edge Computing", "AI", "Enterprise"),
                4.8,
                1400,
                false,
                false
            ),

            // AR/VR (Augmented & Virtual Reality) - 3 Levels
            createCourse(
                "Introduction to AR/VR Development",
                "Create basic AR and VR experiences using Unity and AR Foundation.",
                "AR/VR",
                "Beginner",
                "Ryan Garcia",
                58,
                Arrays.asList("AR/VR", "Unity", "AR Foundation", "Virtual Reality", "Augmented Reality"),
                4.5,
                5600,
                true,
                false
            ),
            createCourse(
                "Advanced VR Game Development",
                "Build immersive VR games and applications for Oculus and HTC Vive.",
                "AR/VR",
                "Intermediate",
                "Nicole Adams",
                75,
                Arrays.asList("AR/VR", "VR Games", "Oculus", "Unity", "Immersive"),
                4.7,
                3200,
                true,
                false
            ),
            createCourse(
                "Enterprise AR/VR Solutions",
                "Develop professional AR/VR applications for training and visualization.",
                "AR/VR",
                "Advanced",
                "Gregory White",
                90,
                Arrays.asList("AR/VR", "Enterprise", "Training", "Visualization", "Professional"),
                4.6,
                1100,
                false,
                false
            ),

            // Network Engineering - Additional Beginner Course
            createCourse(
                "Networking Basics for Beginners",
                "Learn fundamental networking concepts including TCP/IP, routing, and switching.",
                "Network Engineering",
                "Beginner",
                "Catherine Moore",
                48,
                Arrays.asList("Network Engineering", "Networking", "TCP/IP", "Routing", "Switching"),
                4.4,
                6800,
                true,
                false
            ),

            // ========================================
            // MACHINE LEARNING - Separate Category (Beginner → Intermediate → Advanced)
            // ========================================
            createCourse(
                "Machine Learning for Beginners",
                "Start your ML journey with supervised learning, linear regression, and decision trees.",
                "Machine Learning",
                "Beginner",
                "Dr. Alan Turing",
                45,
                Arrays.asList("Machine Learning", "Python", "Scikit-Learn", "Supervised Learning"),
                4.7,
                7200,
                true,
                true
            ),
            createCourse(
                "Intermediate Machine Learning",
                "Dive deeper into ensemble methods, feature engineering, and model optimization.",
                "Machine Learning",
                "Intermediate",
                "Dr. Priya Sharma",
                55,
                Arrays.asList("Machine Learning", "Feature Engineering", "Ensemble Methods", "XGBoost"),
                4.8,
                4500,
                true,
                false
            ),
            createCourse(
                "Advanced Machine Learning & Deep Learning",
                "Master advanced ML techniques, neural networks, CNNs, RNNs, and GANs.",
                "Machine Learning",
                "Advanced",
                "Prof. Geoffrey Hinton",
                75,
                Arrays.asList("Machine Learning", "Deep Learning", "Neural Networks", "TensorFlow", "PyTorch"),
                4.9,
                2800,
                true,
                false
            ),

            // ========================================
            // MOBILE DEVELOPMENT - Complete All Levels
            // ========================================
            createCourse(
                "Mobile App Development for Beginners",
                "Introduction to mobile development concepts, UI/UX basics, and app lifecycle.",
                "Mobile Development",
                "Beginner",
                "Sarah Williams",
                35,
                Arrays.asList("Mobile Development", "App Development", "UI/UX", "Beginner"),
                4.5,
                8900,
                true,
                false
            ),
            createCourse(
                "Advanced Mobile App Architecture",
                "Master advanced patterns like MVVM, Clean Architecture, and microservices for mobile.",
                "Mobile Development",
                "Advanced",
                "Dr. Martin Fowler",
                65,
                Arrays.asList("Mobile Development", "Architecture", "Design Patterns", "MVVM", "Clean Code"),
                4.9,
                1900,
                false,
                false
            ),

            // ========================================
            // ARTIFICIAL INTELLIGENCE - Intermediate Missing
            // ========================================
            createCourse(
                "Intermediate Artificial Intelligence",
                "Explore AI agents, search algorithms, constraint satisfaction, and knowledge representation.",
                "Artificial Intelligence",
                "Intermediate",
                "Prof. Stuart Russell",
                52,
                Arrays.asList("AI", "Artificial Intelligence", "AI Agents", "Search Algorithms", "Knowledge Representation"),
                4.8,
                3600,
                true,
                false
            ),

            // ========================================
            // WEB DEVELOPMENT - Additional Advanced Course
            // ========================================
            createCourse(
                "Modern Frontend Frameworks Mastery",
                "Deep dive into React, Vue, and Angular with state management and performance optimization.",
                "Web Development",
                "Expert",
                "Dan Abramov",
                70,
                Arrays.asList("React", "Vue", "Angular", "Redux", "State Management", "Performance"),
                4.9,
                2400,
                true,
                false
            )
        );
    }

    private BrowseCourse createCourse(
            String title,
            String description,
            String category,
            String difficulty,
            String instructor,
            int duration,
            List<String> tags,
            double rating,
            int studentsCount,
            boolean isTrending,
            boolean isFeatured) {
        
        BrowseCourse course = new BrowseCourse(title, description, category, difficulty, instructor);
        course.setDuration(duration);
        course.setTags(tags);
        course.setRating(rating);
        course.setStudentsCount(studentsCount);
        course.setTrending(isTrending);
        course.setFeatured(isFeatured);
        course.setPublished(true);
        
        // Set image URL based on category
        String imageUrl = getCategoryImageUrl(category);
        course.setImageUrl(imageUrl);
        
        course.calculatePopularityScore();
        
        return course;
    }
    
    private String getCategoryImageUrl(String category) {
        // Using reliable placeholder images from Unsplash
        switch (category.toLowerCase()) {
            case "artificial intelligence":
            case "ai & ml":
                return "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800";
            case "web development":
                return "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800";
            case "data science":
                return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800";
            case "mobile development":
                return "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800";
            case "cloud computing":
                return "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800";
            case "cybersecurity":
                return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800";
            case "devops":
                return "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800";
            case "programming":
                return "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800";
            case "design":
                return "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800";
            case "business":
                return "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800";
            default:
                return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
        }
    }
}
