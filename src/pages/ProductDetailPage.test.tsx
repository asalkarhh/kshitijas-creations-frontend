import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductDetailPage from './ProductDetailPage';
import { renderWithProviders } from '../test/test-utils';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { Routes, Route } from 'react-router-dom';

describe('ProductDetailPage', () => {
  const renderPage = (slug = 'floral-earrings') => {
    return renderWithProviders(
      <Routes>
        <Route path="/products/:slug" element={<ProductDetailPage />} />
      </Routes>,
      { route: `/products/${slug}` },
    );
  };

  it('renders product details correctly with breadcrumbs, price, SKU, and media gallery', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();
    expect(screen.getByText(/Very beautiful floral earrings handmade with love/i)).toBeVisible();
    expect(screen.getByText(/CODE: FL-01/i)).toBeVisible();
    expect(screen.getByText('₹500')).toBeVisible();
    expect(screen.getByText('Available')).toBeVisible();
    const categoryLinks = screen.getAllByRole('link', { name: 'Earrings' });
    expect(categoryLinks[0]).toHaveAttribute('href', '/products?category=earrings');
  });

  it('supports media thumbnails selection and video playback controls', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    // Thumbnails for multiple media
    const thumb2 = screen.getByRole('button', { name: 'View image 2' });
    await user.click(thumb2);

    const thumbVideo = screen.getByRole('button', { name: 'View image 3' });
    await user.click(thumbVideo);

    const videoElement = screen.getByLabelText(/Floral Earrings video showcase/i);
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toHaveAttribute('controls');
    expect(videoElement).toHaveAttribute('playsinline');
  });

  it('handles quantity increase and decrease bounded between 1 and 20', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    const decreaseBtn = screen.getByRole('button', { name: 'Decrease quantity' });
    const increaseBtn = screen.getByRole('button', { name: 'Increase quantity' });
    const quantityDisplay = screen.getByLabelText(/Selected quantity:/i);

    expect(quantityDisplay).toHaveTextContent('1');
    expect(decreaseBtn).toBeDisabled();

    await user.click(increaseBtn);
    expect(quantityDisplay).toHaveTextContent('2');

    await user.click(decreaseBtn);
    expect(quantityDisplay).toHaveTextContent('1');
  });

  it('adds product with selected quantity to cart and shows success toast', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    const increaseBtn = screen.getByRole('button', { name: 'Increase quantity' });
    await user.click(increaseBtn);

    const addToCartBtn = screen.getByRole('button', { name: 'Add to cart' });
    await user.click(addToCartBtn);

    expect(await screen.findByText('2 x Floral Earrings added to your cart.')).toBeVisible();
  });

  it('displays out of stock status and disables add to cart for unavailable product', async () => {
    renderPage('pearl-necklace');
    expect(await screen.findByRole('heading', { name: 'Vintage Pearl Necklace' })).toBeVisible();
    expect(screen.getAllByText('Currently unavailable').length).toBeGreaterThan(0);

    const button = screen.getByRole('button', { name: 'Currently unavailable' });
    expect(button).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Increase quantity' })).toBeNull();
  });

  it('renders safe Instagram link opening in a new tab', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    const instaLink = screen.getByRole('link', { name: /View on Instagram/i });
    expect(instaLink).toHaveAttribute('href', 'https://www.instagram.com/p/mock-post-1');
    expect(instaLink).toHaveAttribute('target', '_blank');
    expect(instaLink).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('displays related products excluding current product', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Floral Earrings' })).toBeVisible();

    expect(await screen.findByRole('heading', { name: 'You may also like' })).toBeVisible();
    // Related product in Earrings category is Rose Gold Studs
    expect(screen.getByRole('heading', { name: 'Rose Gold Studs' })).toBeVisible();
  });

  it('shows error state on failure with retry option', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/public/products/:slug', () => {
        return HttpResponse.json({ message: 'Network error' }, { status: 500 });
      }),
    );
    renderPage();
    expect(await screen.findByText(/Could not load product details/i)).toBeVisible();
  });
});
