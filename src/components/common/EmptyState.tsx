import type { ReactNode } from 'react';

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="rounded-4xl border border-beige bg-surface px-6 py-14 text-center">
    <h2 className="font-display text-2xl text-ink">{title}</h2>
    <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
