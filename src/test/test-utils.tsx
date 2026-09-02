import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../components/common/Toast';
import { AuthProvider } from '../store/auth-context';
import { CartProvider } from '../store/cart-context';

interface ProviderProps {
  children: ReactNode;
  route?: string;
}

const Providers = ({ children, route = '/' }: ProviderProps) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>{children}</ToastProvider>
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', ...options }: RenderOptions & { route?: string } = {},
) =>
  render(ui, {
    wrapper: ({ children }) => <Providers route={route}>{children}</Providers>,
    ...options,
  });
