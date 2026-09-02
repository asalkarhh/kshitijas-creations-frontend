import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-maroon text-white hover:bg-maroon/90 disabled:bg-muted/50',
  secondary: 'border border-maroon/25 bg-surface text-maroon hover:bg-rose/35',
  ghost: 'text-maroon hover:bg-rose/35',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) => (
  <button
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-maroon disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
