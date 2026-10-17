import { render, screen } from '@testing-library/react';
import { PagePreloader } from './PagePreloader';
import { getThemeLineForPath } from '../../routes/PageTransitionPreloader';

describe('PagePreloader', () => {
  it('renders brand image in a round circle with role status and title', () => {
    render(<PagePreloader label="Loading Kshitija’s Creations" />);

    expect(screen.getByRole('status', { name: /Loading Kshitija’s Creations/i })).toBeInTheDocument();
    const logoImg = screen.getByRole('img', { name: "Kshitija's Creations" });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveClass('rounded-full');
    expect(screen.getByText('Kshitija’s Creations')).toBeInTheDocument();
    expect(screen.getByText('Handmade Studio')).toBeInTheDocument();
  });

  it('renders custom thematic one-liner when provided', () => {
    const customLine = 'Crafting unique jewellery with individual attention';
    render(<PagePreloader themeLine={customLine} />);

    expect(screen.getByText(customLine)).toBeInTheDocument();
  });

  it('renders in non-fullscreen layout when fullscreen is false', () => {
    const { container } = render(<PagePreloader fullscreen={false} />);
    const preloaderDiv = container.querySelector('[role="status"]');
    expect(preloaderDiv).not.toHaveClass('fixed');
    expect(preloaderDiv).toHaveClass('min-h-[50vh]');
  });
});

describe('getThemeLineForPath', () => {
  it('returns appropriate artisan phrases based on pathname', () => {
    expect(getThemeLineForPath('/products')).toMatch(/handcrafted earrings, chokers/i);
    expect(getThemeLineForPath('/products/floral-earrings')).toMatch(/handmade details & artisan finishing/i);
    expect(getThemeLineForPath('/categories')).toMatch(/earrings, necklaces, bangles/i);
    expect(getThemeLineForPath('/cart')).toMatch(/Gathering your selected handcrafted pieces/i);
    expect(getThemeLineForPath('/checkout')).toMatch(/delivery details/i);
    expect(getThemeLineForPath('/admin/orders')).toMatch(/Artisan Atelier/i);
    expect(getThemeLineForPath('/terms')).toMatch(/studio care guidelines/i);
    expect(getThemeLineForPath('/')).toMatch(/Handcrafted jewellery & celebratory keepsakes/i);
  });
});
