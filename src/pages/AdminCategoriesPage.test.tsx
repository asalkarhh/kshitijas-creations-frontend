import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCategoriesPage from './AdminCategoriesPage';
import { renderWithProviders } from '../test/test-utils';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('AdminCategoriesPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'mock-jwt-token-valid');
  });

  it('renders category list with names, slugs, and active status', async () => {
    renderWithProviders(<AdminCategoriesPage />);

    expect(await screen.findByText('Earrings')).toBeVisible();
    expect(screen.getByText('/earrings')).toBeVisible();
    expect(screen.getByText('Necklaces')).toBeVisible();
    expect(screen.getByText('Bracelets')).toBeVisible();
  });

  it('opens create modal, validates required name, and creates new category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminCategoriesPage />);

    expect(await screen.findByText('Earrings')).toBeVisible();

    // Click Add Category
    const addBtn = screen.getByRole('button', { name: /Add Category/i });
    await user.click(addBtn);

    // Modal dialog is visible
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Add New Category' })).toBeVisible();

    // Submit with empty name
    const submitBtn = screen.getByRole('button', { name: 'Create Category' });
    await user.click(submitBtn);

    expect(await screen.findByText('Category name is required.')).toBeVisible();

    // Fill valid data
    await user.type(screen.getByLabelText(/Category name/i), 'Hair Accessories');
    await user.type(screen.getByLabelText(/Description/i), 'Handmade hair pins and combs');

    await user.click(submitBtn);

    // Modal closes and toast notification appears
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(await screen.findByText('Category "Hair Accessories" created successfully.')).toBeVisible();
  });

  it('opens edit modal with prepopulated values and updates category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminCategoriesPage />);

    expect(await screen.findByText('Earrings')).toBeVisible();

    const editBtn = screen.getByRole('button', { name: 'Edit Earrings' });
    await user.click(editBtn);

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Edit Category' })).toBeVisible();
    expect(screen.getByLabelText(/Category name/i)).toHaveValue('Earrings');

    await user.clear(screen.getByLabelText(/Category name/i));
    await user.type(screen.getByLabelText(/Category name/i), 'Artisan Earrings');

    const updateBtn = screen.getByRole('button', { name: 'Update Category' });
    await user.click(updateBtn);

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(await screen.findByText('Category "Artisan Earrings" updated successfully.')).toBeVisible();
  });

  it('opens delete confirmation and deletes category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AdminCategoriesPage />);

    expect(await screen.findByText('Earrings')).toBeVisible();

    const deleteBtn = screen.getByRole('button', { name: 'Delete Earrings' });
    await user.click(deleteBtn);

    // Confirmation dialog
    expect(screen.getByRole('heading', { name: 'Remove Category' })).toBeVisible();

    const confirmBtn = screen.getByRole('button', { name: 'Remove Category' });
    await user.click(confirmBtn);

    expect(await screen.findByText('Category "Earrings" removed successfully.')).toBeVisible();
  });

  it('handles category fetch errors and allows retrying', async () => {
    const user = userEvent.setup();
    let fail = true;

    server.use(
      http.get('http://localhost:8080/api/v1/admin/categories', () => {
        if (fail) {
          return HttpResponse.json({ message: 'Category service failure' }, { status: 500 });
        }
        return HttpResponse.json([
          {
            id: 'c-recovered',
            name: 'Recovered Gems',
            slug: 'recovered-gems',
            description: 'Recovered category',
            isActive: true,
          },
        ]);
      }),
    );

    renderWithProviders(<AdminCategoriesPage />);
    expect(await screen.findByText('Unable to load categories')).toBeVisible();

    fail = false;
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryBtn);

    expect(await screen.findByText('Recovered Gems')).toBeVisible();
  });
});

