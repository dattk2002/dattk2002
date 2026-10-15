export const profile = {
  username: 'dattk2002',
  excludeRepositories: ['dattk2002'],
  languagesLimit: 6,
};

// Verified against the owner's portfolio; independent of public repository byte shares.
export const technology = [
  { label: 'WEB', description: 'Interfaces people use', tools: [
    ['TypeScript', 'typescript'], ['React', 'react'], ['Next.js', 'nextdotjs'], ['Tailwind CSS', 'tailwindcss'],
  ] },
  { label: 'MOBILE', description: 'Across platforms', tools: [
    ['Flutter', 'flutter'], ['React Native', 'react'], ['Expo', 'expo'],
  ] },
  { label: 'BACKEND', description: 'Systems behind the screen', tools: [
    ['Python', 'python'], ['FastAPI', 'fastapi'], ['NestJS', 'nestjs'], ['ASP.NET Core', 'dotnet'],
  ] },
  { label: 'DATA', description: 'State, models & speed', tools: [
    ['PostgreSQL', 'postgresql'], ['MongoDB', 'mongodb'], ['Redis', 'redis'],
  ] },
  { label: 'AI & RESEARCH', description: 'Grounded, observable AI', tools: [
    ['Gemini', 'googlegemini'], ['Exa', null], ['Tavily', null], ['Langfuse', null],
  ] },
  { label: 'DELIVERY & QUALITY', description: 'From test to production', tools: [
    ['Docker', 'docker'], ['GitHub Actions', 'githubactions'], ['Render', 'render'], ['Neon', null], ['Vercel', 'vercel'], ['Playwright', null],
  ] },
];
