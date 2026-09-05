import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SearchBar } from '../src/components/search/SearchBar';

function renderBar(onSearch: ReturnType<typeof vi.fn> = vi.fn()): void {
  render(
    <MemoryRouter>
      <SearchBar onSearch={onSearch} />
    </MemoryRouter>
  );
}

describe('SearchBar', () => {
  it('renders with accessible label', () => {
    renderBar();
    expect(screen.getByLabelText('Search name, username or GitHub URL')).toBeInTheDocument();
  });

  it('disables search for short queries', async () => {
    const user = userEvent.setup();
    renderBar();
    const input = screen.getByLabelText('Search name, username or GitHub URL');
    await user.type(input, 'a');
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  });

  it('calls onSearch for valid queries', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    renderBar(onSearch);
    const input = screen.getByLabelText('Search name, username or GitHub URL');
    await user.type(input, 'torvalds');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(onSearch).toHaveBeenCalledWith('torvalds');
  });
});
