import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RepositoryCard } from '../src/components/repo/RepositoryCard';
import type { PublicRepository } from '../src/types';

const repo: PublicRepository = {
  platform: 'github',
  name: 'react-trace-ui',
  fullName: 'rahulsharma/react-trace-ui',
  description: 'A component library.',
  url: 'https://github.com/rahulsharma/react-trace-ui',
  language: 'TypeScript',
  stars: 120,
  forks: 14,
  topics: ['react', 'ui'],
  license: 'MIT',
  healthScore: 82,
};

describe('RepositoryCard', () => {
  it('renders name, language and stats', () => {
    render(<RepositoryCard repo={repo} />);
    expect(screen.getByText('rahulsharma/react-trace-ui')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('MIT')).toBeInTheDocument();
  });

  it('shows the health badge with the score', () => {
    render(<RepositoryCard repo={repo} />);
    expect(screen.getByText('Health 82/100')).toBeInTheDocument();
  });

  it('links to the repository', () => {
    render(<RepositoryCard repo={repo} />);
    expect(screen.getByRole('link', { name: 'rahulsharma/react-trace-ui' })).toHaveAttribute(
      'href',
      repo.url
    );
  });

  it('renders topics as chips', () => {
    render(<RepositoryCard repo={repo} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('ui')).toBeInTheDocument();
  });
});
