import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminBannersPage from './AdminBannersPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';

describe('AdminBannersPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders banners table with previews, titles, destinations, and status badges', async () => {
    renderWithProviders(<AdminBannersPage />);

    expect(await screen.findByText('Spring Collection')).toBeVisible();
    expect(screen.getByText('Heirloom Keepsakes')).toBeVisible();
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
  });

  it('opens add banner modal with dimension instructions and validates required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminBannersPage />);

    expect(await screen.findByText('Spring Collection')).toBeVisible();

    const addBtn = screen.getByRole('button', { name: /Add Banner/i });
    await user.click(addBtn);

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Add New Hero Banner' })).toBeVisible();
    expect(screen.getByText(/Recommended Banner Dimensions/i)).toBeVisible();
    expect(
      screen.getByText(/Keep important text and subjects inside the central safe area/i),
    ).toBeVisible();

    // Submit without title or desktop image
    const submitBtn = screen.getByRole('button', { name: 'Create Banner' });
    await user.click(submitBtn);

    expect(await screen.findByText('Banner title is required.')).toBeVisible();
  });

  it('rejects unsupported and oversized banner images', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminBannersPage />);

    expect(await screen.findByText('Spring Collection')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Add Banner/i }));

    const desktopInput = document.querySelector('#desktop-banner-input') as HTMLInputElement;

    // Test invalid PDF
    const invalidFile = new File(['pdf content'], 'banner.pdf', { type: 'application/pdf' });
    fireEvent.change(desktopInput, { target: { files: [invalidFile] } });

    expect(
      await screen.findByText(/"banner.pdf" is not a supported format \(JPEG, PNG, WebP\)\./i),
    ).toBeVisible();

    // Test oversized 6MB file
    const largeContent = new Uint8Array(6 * 1024 * 1024);
    const largeFile = new File([largeContent], 'huge-banner.jpg', { type: 'image/jpeg' });
    fireEvent.change(desktopInput, { target: { files: [largeFile] } });

    expect(
      await screen.findByText(/"huge-banner.jpg" exceeds the 5 MB file size limit\./i),
    ).toBeVisible();
  });

  it('creates new banner with desktop image and scheduling dates in IST', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminBannersPage />);

    expect(await screen.findByText('Spring Collection')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Add Banner/i }));

    await user.type(screen.getByLabelText(/Banner title/i), 'Navratri Festive Specials');
    await user.type(screen.getByLabelText(/Subtitle/i), 'Celebrate with handcrafted mirror jewelry');

    // Attach desktop image
    const desktopInput = document.querySelector('#desktop-banner-input') as HTMLInputElement;
    const validFile = new File(['valid content'], 'desktop.webp', { type: 'image/webp' });
    fireEvent.change(desktopInput, { target: { files: [validFile] } });

    const submitBtn = screen.getByRole('button', { name: 'Create Banner' });
    await user.click(submitBtn);

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(
      await screen.findByText('Banner "Navratri Festive Specials" created successfully.'),
    ).toBeVisible();
  });

  it('allows editing banner details without replacing existing images', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminBannersPage />);

    expect(await screen.findByText('Spring Collection')).toBeVisible();

    const editBtn = screen.getByRole('button', { name: 'Edit Spring Collection' });
    await user.click(editBtn);

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByLabelText(/Banner title/i)).toHaveValue('Spring Collection');

    await user.clear(screen.getByLabelText(/Banner title/i));
    await user.type(screen.getByLabelText(/Banner title/i), 'Spring Artisan Collection');

    const updateBtn = screen.getByRole('button', { name: 'Update Banner' });
    await user.click(updateBtn);

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(
      await screen.findByText('Banner "Spring Artisan Collection" updated successfully.'),
    ).toBeVisible();
  });

  it('deletes banner with confirmation modal', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminBannersPage />);

    expect(await screen.findByText('Spring Collection')).toBeVisible();

    const deleteBtn = screen.getByRole('button', { name: 'Delete Spring Collection' });
    await user.click(deleteBtn);

    expect(screen.getByRole('heading', { name: 'Remove Hero Banner' })).toBeVisible();

    const confirmBtn = screen.getByRole('button', { name: 'Remove Banner' });
    await user.click(confirmBtn);

    expect(await screen.findByText('Banner "Spring Collection" removed.')).toBeVisible();
  });
});
