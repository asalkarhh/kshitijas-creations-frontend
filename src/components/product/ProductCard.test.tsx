import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApiProducts } from '../../test/mocks/handlers';
import { renderWithProviders } from '../../test/test-utils';
import { ProductCard } from './ProductCard';
import type { Product } from '../../types';

describe('ProductCard', () => {
  it('exposes useful names for product actions, category, INR price, and media', () => {
    const product = mockApiProducts[0];
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByRole('img', { name: product.media[0].altText })).toBeVisible();
    expect(screen.getByText(product.category.name)).toBeVisible();
    expect(screen.getByRole('link', { name: product.name })).toHaveAttribute(
      'href',
      `/products/${product.slug}`,
    );
    expect(screen.getByText('₹500')).toBeVisible();
    expect(screen.getByRole('button', { name: `Add ${product.name} to cart` })).toBeEnabled();
    const instaLink = screen.getByRole('link', { name: `View ${product.name} on Instagram` });
    expect(instaLink).toHaveAttribute('target', '_blank');
    expect(instaLink).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('handles adding in-stock products to cart', async () => {
    const user = userEvent.setup();
    const product = mockApiProducts[0];
    renderWithProviders(<ProductCard product={product} />);
    const addButton = screen.getByRole('button', { name: `Add ${product.name} to cart` });
    await user.click(addButton);
  });

  it('prevents unavailable products from being added', () => {
    const unavailableProduct: Product = {
      ...mockApiProducts[0],
      id: 'prod-unavail',
      isAvailable: false,
      available: false,
    };
    renderWithProviders(<ProductCard product={unavailableProduct} />);
    expect(
      screen.getByRole('button', { name: `Add ${unavailableProduct.name} to cart` }),
    ).toBeDisabled();
    expect(screen.getByText('Currently unavailable')).toBeVisible();
  });

  it('renders a fallback placeholder when media is missing', () => {
    const productWithoutMedia: Product = {
      ...mockApiProducts[0],
      id: 'prod-no-media',
      media: [],
    };
    renderWithProviders(<ProductCard product={productWithoutMedia} />);
    expect(screen.getByRole('img', { name: productWithoutMedia.name })).toBeVisible();
  });
});
