import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchScore } from '../src/components/profile/MatchScore';

describe('MatchScore', () => {
  it('shows the score and the human label', () => {
    render(<MatchScore score={94} label="very_likely" />);
    expect(screen.getByText('94%')).toBeInTheDocument();
    expect(screen.getByText('Very likely')).toBeInTheDocument();
  });

  it('is accessible with an aria label', () => {
    render(<MatchScore score={62} label="possible" />);
    expect(screen.getByRole('img', { name: 'Match confidence 62 percent' })).toBeInTheDocument();
  });

  it('clamps out-of-range scores', () => {
    render(<MatchScore score={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<MatchScore score={80} />);
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
