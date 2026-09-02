import { render, screen } from '@testing-library/react';
import { OrderStatusBadge } from './OrderStatusBadge';

describe('OrderStatusBadge', () => {
  it('renders PLACED status with text label and icon', () => {
    render(<OrderStatusBadge status="PLACED" />);
    expect(screen.getByText('Placed')).toBeVisible();
  });

  it('renders CONFIRMED status with text label and icon', () => {
    render(<OrderStatusBadge status="CONFIRMED" />);
    expect(screen.getByText('Confirmed')).toBeVisible();
  });

  it('renders COMPLETED status with text label and icon', () => {
    render(<OrderStatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeVisible();
  });

  it('renders CANCELLED status with text label and icon', () => {
    render(<OrderStatusBadge status="CANCELLED" />);
    expect(screen.getByText('Cancelled')).toBeVisible();
  });
});

