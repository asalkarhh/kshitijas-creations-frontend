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
      <div className={`mb-2.5 inline-flex items-center gap-2 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="h-px w-5 bg-gold/60" />
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-maroon font-sans">
          {eyebrow}
        </p>
        <span className="h-px w-5 bg-gold/60" />
      </div>
    )}
    <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-4xl leading-[1.15]">
      {title}
    </h2>
    {description && (
      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base font-sans">
        {description}
      </p>
    )}
  </div>
);
