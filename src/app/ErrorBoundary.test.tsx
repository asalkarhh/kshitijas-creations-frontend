import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const FaultyComponent = () => {
  throw new Error('Test crash');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Normal content')).toBeVisible();
  });

  it('catches render error and displays friendly fallback with refresh button', () => {
    render(
      <ErrorBoundary>
        <FaultyComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh page' })).toBeVisible();
  });
});
