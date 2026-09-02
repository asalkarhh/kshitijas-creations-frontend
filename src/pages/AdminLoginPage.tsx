import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { BrandMark } from '../components/layout/BrandMark';
import { usePageMetadata } from '../hooks/use-page-metadata';
import { adminLoginSchema, type AdminLoginFormValues } from '../schemas/auth';
import { useAuth, sanitizeAdminRedirect } from '../store/auth-context';
import type { ApiError } from '../types';

const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  usePageMetadata({
    title: 'Admin sign in',
    description: 'Sign in to access the Kshitija’s Creations administration portal.',
    canonicalPath: '/admin/login',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const state = location.state as { from?: string } | undefined;
  const redirectTarget = sanitizeAdminRedirect(state?.from);

  const onSubmit = async (formValues: AdminLoginFormValues) => {
    setErrorMessage(null);
    try {
      await login({
        email: formValues.email.trim(),
        password: formValues.password,
      });
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      const error = err as ApiError;
      if (error.status === 401 || error.status === 400 || error.status === 403) {
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
      } else {
        setErrorMessage(
          error.message ||
            'Unable to connect to the authentication service. Please check your connection and try again.',
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block">
          <BrandMark />
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Admin Portal
        </h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to manage catalog, orders, and studio settings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-3xl border border-beige bg-surface p-8 shadow-soft sm:p-10">
          {errorMessage && (
            <div
              className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
              role="alert"
            >
              <ShieldAlert className="size-5 shrink-0 text-rose-600 mt-0.5" />
              <p className="flex-1">{errorMessage}</p>
            </div>
          )}

          <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="email">
                Admin email
              </label>
              <input
                {...register('email')}
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={Boolean(errors.email)}
                autoComplete="email"
                className="form-input"
                id="email"
                placeholder="admin@kshitijascreations.com"
                type="email"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-maroon" id="email-error" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={Boolean(errors.password)}
                  autoComplete="current-password"
                  className="form-input pr-11"
                  id="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-maroon rounded"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-maroon" id="password-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                aria-busy={isSubmitting}
                className="button-primary w-full justify-center min-h-12"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="size-4" /> Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-beige pt-6 text-center">
            <Link
              className="text-xs font-semibold text-muted hover:text-maroon underline-offset-4 hover:underline"
              to="/"
            >
              ← Return to public store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

