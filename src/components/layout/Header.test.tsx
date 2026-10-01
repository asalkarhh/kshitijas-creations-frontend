import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/test-utils';
import { Header } from './Header';

describe('Header', () => {
  it('provides the primary navigation links', () => {
    renderWithProviders(<Header />);
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(navigation).toHaveTextContent('Home');
    expect(navigation).toHaveTextContent('Products');
    expect(navigation).toHaveTextContent('Categories');
    expect(screen.getByRole('link', { name: /Visit Kshitija's Creations on Instagram/i })).toBeInTheDocument();
  });

  it('opens and closes the mobile navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cart' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close Menu' }));
    expect(screen.queryByRole('navigation', { name: 'Mobile navigation' })).not.toBeInTheDocument();
  });
});
