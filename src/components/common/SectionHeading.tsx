interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) => (
  <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
    {eyebrow && (
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-maroon/75">{eyebrow}</p>
    )}
    <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
    {description && <p className="mt-3 leading-7 text-muted">{description}</p>}
  </div>
);
