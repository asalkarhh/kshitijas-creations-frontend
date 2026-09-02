import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import AdminProductFormPage from './AdminProductFormPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

const renderFormPage = (route = '/admin/products/new') => {
  return renderWithProviders(
    <Routes>
      <Route element={<AdminProductFormPage />} path="/admin/products/new" />
      <Route element={<AdminProductFormPage />} path="/admin/products/:id/edit" />
    </Routes>,
    { route },
  );
};

describe('AdminProductFormPage - Create Mode', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders product creation form with all required fields', async () => {
    renderFormPage('/admin/products/new');

    expect(await screen.findByRole('heading', { name: 'Add New Product' })).toBeVisible();
    expect(screen.getByLabelText(/Product name/i)).toBeVisible();
    expect(screen.getByLabelText(/Product code \/ SKU/i)).toBeVisible();
    expect(screen.getByLabelText(/Category/i)).toBeVisible();
    expect(screen.getByLabelText(/Price \(INR\)/i)).toBeVisible();
    expect(screen.getByLabelText(/Full description/i)).toBeVisible();
    expect(screen.getByLabelText(/Instagram URL/i)).toBeVisible();
  });

  it('validates required fields and Instagram URL format', async () => {
    const user = userEvent.setup();
    renderFormPage('/admin/products/new');

    expect(await screen.findByRole('heading', { name: 'Add New Product' })).toBeVisible();

    const submitBtn = screen.getByRole('button', { name: 'Create Product' });
    await user.click(submitBtn);

    expect(await screen.findByText('Product name is required.')).toBeVisible();
    expect(screen.getByText('Product code is required.')).toBeVisible();
    expect(screen.getByText('Please select a category.')).toBeVisible();
    expect(screen.getByText('Product description is required.')).toBeVisible();

    // Test invalid Instagram URL
    await user.type(screen.getByLabelText(/Instagram URL/i), 'https://twitter.com/post');
    await user.click(submitBtn);

    expect(
      await screen.findByText(
        'Instagram URL must use HTTPS and belong to instagram.com or instagr.am.',
      ),
    ).toBeVisible();
  });

  it('rejects unsupported file formats and oversized files', async () => {
    renderFormPage('/admin/products/new');

    expect(await screen.findByRole('heading', { name: 'Add New Product' })).toBeVisible();

    const fileInput = document.querySelector('#media-upload-input') as HTMLInputElement;

    // Mock an unsupported PDF file
    const invalidFile = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(
      await screen.findByText(
        /"document.pdf" is not a supported image \(JPEG\/PNG\/WebP\) or video \(MP4\/WebM\)\./i,
      ),
    ).toBeVisible();

    // Mock an oversized 6MB image
    const largeContent = new Uint8Array(6 * 1024 * 1024);
    const largeImage = new File([largeContent], 'large-photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [largeImage] } });

    expect(
      await screen.findByText(/"large-photo.jpg" exceeds the 5 MB limit for images\./i),
    ).toBeVisible();
  });

  it('creates product and uploads selected media successfully', async () => {
    const user = userEvent.setup();
    renderFormPage('/admin/products/new');

    expect(await screen.findByRole('heading', { name: 'Add New Product' })).toBeVisible();

    await user.type(screen.getByLabelText(/Product name/i), 'Emerald Cascade Necklace');
    await user.type(screen.getByLabelText(/Product code \/ SKU/i), 'EM-09');

    // Wait for categories to load
    await screen.findByText('Earrings');
    await user.selectOptions(screen.getByLabelText(/Category/i), 'cat-1');

    await user.clear(screen.getByLabelText(/Price \(INR\)/i));
    await user.type(screen.getByLabelText(/Price \(INR\)/i), '1450');
    await user.type(screen.getByLabelText(/Full description/i), 'Hand-woven emerald stones with gold-plated wire.');

    // Attach a valid image
    const validImage = new File(['valid image content'], 'emerald.png', { type: 'image/png' });
    const fileInput = document.querySelector('#media-upload-input') as HTMLInputElement;
    await user.upload(fileInput, validImage);

    expect(await screen.findByText('Ready to Upload (1)')).toBeVisible();

    const submitBtn = screen.getByRole('button', { name: 'Create Product' });
    await user.click(submitBtn);

    expect(await screen.findByText('Product "Emerald Cascade Necklace" created successfully.')).toBeVisible();
  });

  it('maps backend duplicate product code error to form', async () => {
    const user = userEvent.setup();
    renderFormPage('/admin/products/new');

    expect(await screen.findByRole('heading', { name: 'Add New Product' })).toBeVisible();

    await user.type(screen.getByLabelText(/Product name/i), 'Duplicate Test');
    await user.type(screen.getByLabelText(/Product code \/ SKU/i), 'DUPLICATE-CODE');
    await screen.findByText('Earrings');
    await user.selectOptions(screen.getByLabelText(/Category/i), 'cat-1');
    await user.type(screen.getByLabelText(/Full description/i), 'Testing duplicate');

    const submitBtn = screen.getByRole('button', { name: 'Create Product' });
    await user.click(submitBtn);

    expect(await screen.findByText('Product code must be unique')).toBeVisible();
  });
});

describe('AdminProductFormPage - Edit Mode', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('prepopulates fields and existing media in edit mode', async () => {
    renderFormPage('/admin/products/prod-fl-01/edit');

    expect(await screen.findByRole('heading', { name: /Edit: Floral Earrings/i })).toBeVisible();
    expect(screen.getByLabelText(/Product name/i)).toHaveValue('Floral Earrings');
    expect(screen.getByLabelText(/Product code \/ SKU/i)).toHaveValue('FL-01');
    expect(screen.getByLabelText(/Price \(INR\)/i)).toHaveValue(500);

    // Verify existing media assets are displayed
    expect(screen.getByText('Saved Media')).toBeVisible();
    expect(screen.getByText('Floral Earrings front view')).toBeVisible();
  });

  it('allows deleting an existing media asset with confirmation', async () => {
    const user = userEvent.setup();
    renderFormPage('/admin/products/prod-fl-01/edit');

    expect(await screen.findByRole('heading', { name: /Edit: Floral Earrings/i })).toBeVisible();

    const deleteMediaBtn = screen.getByRole('button', {
      name: 'Remove media asset Floral Earrings front view',
    });
    await user.click(deleteMediaBtn);

    expect(screen.getByRole('heading', { name: 'Delete Media Asset' })).toBeVisible();

    const confirmBtn = screen.getByRole('button', { name: 'Delete Media Asset' });
    await user.click(confirmBtn);

    expect(await screen.findByText('Media asset removed.')).toBeVisible();
  });

  it('displays 404 state when editing a non-existent product', async () => {
    server.use(
      http.get('http://localhost:8080/api/v1/admin/products/:id', () => {
        return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
      }),
    );

    renderFormPage('/admin/products/missing-id/edit');
    expect(await screen.findByRole('heading', { name: 'Product Not Found' })).toBeVisible();
  });
});
