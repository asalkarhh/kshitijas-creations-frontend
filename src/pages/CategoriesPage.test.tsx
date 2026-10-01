import { screen } from '@testing-library/react';
import CategoriesPage from './CategoriesPage';
import { renderWithProviders } from '../test/test-utils';

describe('CategoriesPage', () => {
  it('renders page header, collections count, and square category cards', async () => {
    renderWithProviders(<CategoriesPage />);

    expect(screen.getByRole('heading', { name: 'All categories' })).toBeVisible();
    expect(screen.getByText(/collections available/i)).toBeVisible();
    expect(await screen.findAllByText('Earrings')).not.toHaveLength(0);
    expect(await screen.findAllByText('Explore')).not.toHaveLength(0);
  });
});

