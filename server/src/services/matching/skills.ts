import type { PublicRepository } from '../../types';

const KNOWN_SKILLS = new Set([
  'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'c', 'c++', 'c#',
  'kotlin', 'swift', 'scala', 'dart', 'shell', 'html', 'css', 'sql', 'r', 'perl', 'haskell', 'lua',
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'node.js', 'nodejs', 'node',
  'express', 'fastapi', 'django', 'flask', 'spring', 'rails', 'dotnet', '.net', 'laravel',
  'mongodb', 'postgresql', 'postgres', 'mysql', 'redis', 'firebase', 'supabase', 'prisma', 'graphql',
  'docker', 'kubernetes', 'k8s', 'terraform', 'aws', 'gcp', 'azure', 'ci-cd', 'devops',
  'machine-learning', 'deep-learning', 'pytorch', 'tensorflow', 'pandas', 'numpy',
  'tailwind', 'tailwindcss', 'sass', 'webpack', 'vite', 'jest', 'vitest', 'cypress',
]);

/**
 * Infer skills ONLY from public technical evidence (repository languages and
 * topics). Weights are proportional to how many repos reference the skill and
 * the repo's star counts. Output is clearly "detected", not certified.
 */
export function inferSkills(repositories: PublicRepository[]): Array<{ skill: string; weight: number; count: number }> {
  const scores = new Map<string, { weight: number; count: number }>();

  for (const repo of repositories) {
    const repoWeight = 1 + Math.log2((repo.stars ?? 0) + 1) * 0.2;

    const add = (raw: string, base: number): void => {
      const skill = raw.trim().toLowerCase();
      if (!skill || !KNOWN_SKILLS.has(skill)) return;
      const label = skill === 'nodejs' ? 'node.js' : skill === 'tailwindcss' ? 'tailwind' : skill;
      const entry = scores.get(label) ?? { weight: 0, count: 0 };
      entry.weight += base * repoWeight;
      entry.count += 1;
      scores.set(label, entry);
    };

    if (repo.language) add(repo.language, 3);
    for (const topic of repo.topics ?? []) add(topic, 1.5);
    // Scan description for additional known skills.
    for (const known of KNOWN_SKILLS) {
      if (repo.description && repo.description.toLowerCase().includes(known)) add(known, 0.5);
    }
  }

  return [...scores.entries()]
    .map(([skill, { weight, count }]) => ({ skill, weight: Math.round(weight * 10) / 10, count }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 12);
}
