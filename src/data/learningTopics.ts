export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  keywords: string[];
}

export const learningTopics: LearningTopic[] = [
  {
    id: "javascript",
    title: "JavaScript",
    description:
      "Master modern JavaScript from basics to advanced concepts including ES6+, async/await, and frameworks.",
    icon: "Code",
    color: "#f7df1e",
    category: "Programming",
    difficulty: "Beginner",
    estimatedTime: "6-8 weeks",
    keywords: [
      "javascript",
      "js",
      "programming",
      "web development",
      "frontend",
    ],
  },
  {
    id: "python",
    title: "Python",
    description:
      "Learn Python programming for web development, data science, automation, and machine learning applications.",
    icon: "Terminal",
    color: "#3776ab",
    category: "Programming",
    difficulty: "Beginner",
    estimatedTime: "4-6 weeks",
    keywords: [
      "python",
      "programming",
      "data science",
      "automation",
      "backend",
    ],
  },
  {
    id: "typescript",
    title: "TypeScript",
    description:
      "Add type safety to JavaScript with TypeScript. Perfect for large-scale applications and better developer experience.",
    icon: "FileType",
    color: "#3178c6",
    category: "Programming",
    difficulty: "Intermediate",
    estimatedTime: "3-4 weeks",
    keywords: ["typescript", "ts", "javascript", "types", "web development"],
  },
  {
    id: "java",
    title: "Java",
    description:
      "Enterprise-grade programming language for backend development, Android apps, and large-scale systems.",
    icon: "Coffee",
    color: "#ed8b00",
    category: "Programming",
    difficulty: "Intermediate",
    estimatedTime: "8-10 weeks",
    keywords: ["java", "programming", "backend", "android", "enterprise"],
  },

  {
    id: "react-native",
    title: "React Native",
    description:
      "Build cross-platform mobile apps using React Native. Create iOS and Android apps with a single codebase.",
    icon: "Smartphone",
    color: "#61dafb",
    category: "Mobile",
    difficulty: "Intermediate",
    estimatedTime: "6-8 weeks",
    keywords: ["react native", "mobile", "ios", "android", "cross-platform"],
  },
  {
    id: "flutter",
    title: "Flutter",
    description:
      "Google's UI toolkit for building beautiful, compiled applications for mobile, web, and desktop from a single codebase.",
    icon: "Zap",
    color: "#02569b",
    category: "Mobile",
    difficulty: "Intermediate",
    estimatedTime: "6-8 weeks",
    keywords: ["flutter", "dart", "mobile", "cross-platform", "google"],
  },
  {
    id: "swift",
    title: "Swift & iOS",
    description:
      "Develop native iOS apps using Swift. Learn UIKit, SwiftUI, and iOS development best practices.",
    icon: "Apple",
    color: "#fa7343",
    category: "Mobile",
    difficulty: "Intermediate",
    estimatedTime: "8-10 weeks",
    keywords: ["swift", "ios", "apple", "mobile", "native"],
  },
  {
    id: "kotlin",
    title: "Kotlin & Android",
    description:
      "Modern Android development with Kotlin. Build native Android apps with Google's preferred language.",
    icon: "Android",
    color: "#7f52ff",
    category: "Mobile",
    difficulty: "Intermediate",
    estimatedTime: "8-10 weeks",
    keywords: ["kotlin", "android", "mobile", "native", "google"],
  },

  {
    id: "react",
    title: "React",
    description:
      "Build modern user interfaces with React. Learn components, hooks, state management, and the React ecosystem.",
    icon: "Globe",
    color: "#61dafb",
    category: "Web",
    difficulty: "Intermediate",
    estimatedTime: "6-8 weeks",
    keywords: ["react", "frontend", "web", "javascript", "ui"],
  },
  {
    id: "vue",
    title: "Vue.js",
    description:
      "Progressive JavaScript framework for building user interfaces. Easy to learn and highly performant.",
    icon: "Layers",
    color: "#4fc08d",
    category: "Web",
    difficulty: "Beginner",
    estimatedTime: "4-6 weeks",
    keywords: ["vue", "vuejs", "frontend", "web", "javascript"],
  },
  {
    id: "angular",
    title: "Angular",
    description:
      "Full-featured framework for building scalable web applications with TypeScript and powerful tooling.",
    icon: "Grid",
    color: "#dd0031",
    category: "Web",
    difficulty: "Advanced",
    estimatedTime: "8-10 weeks",
    keywords: ["angular", "frontend", "web", "typescript", "framework"],
  },
  {
    id: "nextjs",
    title: "Next.js",
    description:
      "Full-stack React framework with server-side rendering, static generation, and powerful developer experience.",
    icon: "ArrowRight",
    color: "#000000",
    category: "Web",
    difficulty: "Intermediate",
    estimatedTime: "4-6 weeks",
    keywords: ["nextjs", "react", "fullstack", "ssr", "web"],
  },

  {
    id: "nodejs",
    title: "Node.js",
    description:
      "Server-side JavaScript runtime for building scalable backend applications and APIs.",
    icon: "Server",
    color: "#339933",
    category: "Backend",
    difficulty: "Intermediate",
    estimatedTime: "5-7 weeks",
    keywords: ["nodejs", "backend", "javascript", "api", "server"],
  },
  {
    id: "django",
    title: "Django",
    description:
      "High-level Python web framework for rapid development of secure and maintainable websites.",
    icon: "Database",
    color: "#092e20",
    category: "Backend",
    difficulty: "Intermediate",
    estimatedTime: "6-8 weeks",
    keywords: ["django", "python", "backend", "web", "framework"],
  },
  {
    id: "spring",
    title: "Spring Boot",
    description:
      "Powerful Java framework for building enterprise-grade backend applications and microservices.",
    icon: "Leaf",
    color: "#6db33f",
    category: "Backend",
    difficulty: "Advanced",
    estimatedTime: "8-10 weeks",
    keywords: ["spring", "java", "backend", "enterprise", "microservices"],
  },

  {
    id: "machine-learning",
    title: "Machine Learning",
    description:
      "Learn ML algorithms, data preprocessing, model training, and deployment using Python and popular libraries.",
    icon: "Brain",
    color: "#ff6b6b",
    category: "AI/ML",
    difficulty: "Intermediate",
    estimatedTime: "10-12 weeks",
    keywords: ["machine learning", "ml", "ai", "python", "data science"],
  },
  {
    id: "data-science",
    title: "Data Science",
    description:
      "Extract insights from data using Python, pandas, NumPy, and visualization libraries like matplotlib.",
    icon: "BarChart",
    color: "#4ecdc4",
    category: "AI/ML",
    difficulty: "Intermediate",
    estimatedTime: "8-10 weeks",
    keywords: ["data science", "python", "pandas", "analysis", "visualization"],
  },
  {
    id: "deep-learning",
    title: "Deep Learning",
    description:
      "Neural networks, TensorFlow, PyTorch, and building AI models for image recognition and NLP.",
    icon: "Cpu",
    color: "#9b59b6",
    category: "AI/ML",
    difficulty: "Advanced",
    estimatedTime: "12-15 weeks",
    keywords: [
      "deep learning",
      "neural networks",
      "tensorflow",
      "pytorch",
      "ai",
    ],
  },

  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "Design principles, user research, wireframing, prototyping, and creating beautiful user experiences.",
    icon: "Palette",
    color: "#e74c3c",
    category: "Design",
    difficulty: "Beginner",
    estimatedTime: "6-8 weeks",
    keywords: ["ui", "ux", "design", "figma", "user experience"],
  },
  {
    id: "figma",
    title: "Figma Design",
    description:
      "Master Figma for UI design, prototyping, and collaborative design workflows.",
    icon: "Figma",
    color: "#f24e1e",
    category: "Design",
    difficulty: "Beginner",
    estimatedTime: "3-4 weeks",
    keywords: ["figma", "design", "ui", "prototype", "collaboration"],
  },

  {
    id: "docker",
    title: "Docker",
    description:
      "Containerization technology for packaging applications and managing deployment environments.",
    icon: "Package",
    color: "#2496ed",
    category: "DevOps",
    difficulty: "Intermediate",
    estimatedTime: "4-5 weeks",
    keywords: ["docker", "containers", "devops", "deployment", "microservices"],
  },
  {
    id: "aws",
    title: "AWS Cloud",
    description:
      "Amazon Web Services for cloud computing, storage, databases, and scalable application deployment.",
    icon: "Cloud",
    color: "#ff9900",
    category: "DevOps",
    difficulty: "Intermediate",
    estimatedTime: "8-10 weeks",
    keywords: ["aws", "cloud", "amazon", "devops", "infrastructure"],
  },
  {
    id: "kubernetes",
    title: "Kubernetes",
    description:
      "Container orchestration platform for managing, scaling, and deploying containerized applications.",
    icon: "Settings",
    color: "#326ce5",
    category: "DevOps",
    difficulty: "Advanced",
    estimatedTime: "8-10 weeks",
    keywords: ["kubernetes", "k8s", "devops", "containers", "orchestration"],
  },

  {
    id: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Learn security principles, ethical hacking, network security, and protecting digital assets.",
    icon: "Shield",
    color: "#2c3e50",
    category: "Security",
    difficulty: "Intermediate",
    estimatedTime: "10-12 weeks",
    keywords: ["cybersecurity", "security", "hacking", "network", "protection"],
  },

  {
    id: "blockchain",
    title: "Blockchain & Web3",
    description:
      "Understand blockchain technology, cryptocurrencies, smart contracts, and decentralized applications.",
    icon: "Link",
    color: "#f39c12",
    category: "Blockchain",
    difficulty: "Advanced",
    estimatedTime: "8-10 weeks",
    keywords: ["blockchain", "web3", "crypto", "smart contracts", "defi"],
  },
];

export const categories = [
  "All",
  "Programming",
  "Web",
  "Mobile",
  "Backend",
  "AI/ML",
  "Design",
  "DevOps",
  "Security",
  "Blockchain",
];

export function filterTopics(
  topics: LearningTopic[],
  searchQuery: string,
  selectedCategory: string
): LearningTopic[] {
  let filtered = topics;

  if (selectedCategory !== "All") {
    filtered = filtered.filter((topic) => topic.category === selectedCategory);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (topic) =>
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        topic.keywords.some((keyword) => keyword.toLowerCase().includes(query))
    );
  }

  return filtered;
}
