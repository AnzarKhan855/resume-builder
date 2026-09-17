/**
 * Categorizes a technical or soft skill into standard resume domains
 */
export function categorizeSkill(name: string): string {
  if (!name || typeof name !== "string") return "Technical Skills";

  const lower = name.toLowerCase().trim();
  const languages = [
    "javascript", "typescript", "python", "java", "c++", "c#", "c", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "html", "html5", "css", "css3", "sql",
    "shell", "bash", "r", "scala", "dart", "perl", "matlab", "powershell"
  ];
  const frameworks = [
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "angular", "node.js", "nodejs",
    "express", "express.js", "django", "flask", "fastapi", "spring", "spring boot",
    "asp.net", "ruby on rails", "rails", "tailwind", "tailwindcss", "redux", "graphql",
    "jquery", "bootstrap", "pytorch", "tensorflow", "keras", "pandas", "numpy",
    "scikit-learn", "nestjs", "svelte", "sveltekit"
  ];
  const databases = [
    "postgresql", "postgres", "mysql", "mongodb", "redis", "sqlite", "snowflake",
    "cassandra", "dynamodb", "oracle", "elasticsearch", "supabase", "firebase",
    "mariadb", "neo4j", "prisma"
  ];
  const devops = [
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker",
    "kubernetes", "k8s", "terraform", "ci/cd", "github actions", "jenkins",
    "linux", "nginx", "ansible", "helm", "prometheus", "grafana", "apache"
  ];
  const tools = [
    "git", "github", "gitlab", "jira", "figma", "postman", "vs code", "vscode",
    "tableau", "power bi", "webpack", "vite", "npm", "yarn", "pnpm"
  ];

  if (languages.includes(lower)) return "Programming Languages";
  if (frameworks.includes(lower)) return "Frameworks & Libraries";
  if (databases.includes(lower)) return "Databases";
  if (devops.includes(lower)) return "Cloud & DevOps";
  if (tools.includes(lower)) return "Tools & Platforms";
  return "Technical Skills";
}
