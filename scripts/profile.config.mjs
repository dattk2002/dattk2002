export const profile = {
  username: 'dattk2002',
  excludeRepositories: ['dattk2002'],
  languagesLimit: 6,
};

// Verified against https://www.dattk.dev/api/cv on 2026-10-16.
// A single curated list, independent of public repository byte shares.
export const technology = [
  ['TypeScript', 'typescript'], ['JavaScript', 'javascript'], ['Python', 'python'],
  ['C#', null], ['Dart', 'dart'], ['PHP', 'php'], ['SQL', null],
  ['React', 'react'], ['Next.js', 'nextdotjs'], ['Vite', 'vite'],
  ['Tailwind CSS', 'tailwindcss'], ['shadcn/ui', 'shadcnui'], ['Ant Design', 'antdesign'],
  ['Radix UI', 'radixui'], ['GSAP', 'gsap'], ['Flutter', 'flutter'],
  ['React Native', 'react'], ['Expo', 'expo'], ['FastAPI', 'fastapi'],
  ['NestJS', 'nestjs'], ['ASP.NET Core', 'dotnet'], ['Laravel', 'laravel'],
  ['Strapi', 'strapi'], ['SignalR', null], ['PostgreSQL', 'postgresql'],
  ['MongoDB', 'mongodb'], ['Redis', 'redis'], ['SQLAlchemy', 'sqlalchemy'],
  ['Drizzle ORM', 'drizzle'], ['TypeORM', 'typeorm'], ['EF Core', null],
  ['Firebase', 'firebase'], ['Gemini Grounded Search', 'googlegemini'], ['Exa', null],
  ['Tavily', null], ['Langfuse', null], ['Docker', 'docker'],
  ['GitHub Actions', 'githubactions'], ['Render', 'render'], ['Neon', null],
  ['Vercel', 'vercel'], ['Cloudinary', 'cloudinary'], ['FFmpeg', 'ffmpeg'],
  ['Resend', 'resend'], ['Upstash', 'upstash'], ['Pytest', 'pytest'],
  ['Vitest', 'vitest'], ['Playwright', null],
];

// Short usage captions from the CV and portfolio; omit obvious language labels.
export const technologyNotes = {
  GSAP: 'UI motion',
  Expo: 'Mobile + push',
  Strapi: 'Headless CMS',
  SignalR: 'Real-time chat',
  Redis: 'Cache + limits',
  SQLAlchemy: 'Python ORM',
  'Drizzle ORM': 'Publishing ORM',
  TypeORM: 'NestJS ORM',
  'EF Core': '.NET ORM',
  Firebase: 'Push messaging',
  'Gemini Grounded Search': 'Grounded Search',
  Exa: 'Web research',
  Tavily: 'Source search',
  Langfuse: 'AI tracing',
  Docker: 'App containers',
  'GitHub Actions': 'CI checks',
  Render: 'App hosting',
  Neon: 'Postgres + Auth',
  Vercel: 'Blob uploads',
  Cloudinary: 'Media delivery',
  FFmpeg: 'Video processing',
  Resend: 'Contact emails',
  Upstash: 'Rate limiting',
  Pytest: 'API tests',
  Vitest: 'Frontend tests',
  Playwright: 'Browser tests',
};
