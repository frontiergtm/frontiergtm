export function SectionHeading({
  eyebrow,
  title,
  copy,
  light = false,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`section-title mt-4 ${light ? "text-white" : "text-ink"}`}>{title}</h2>
      {copy ? <p className={`mt-5 text-lg leading-8 ${light ? "text-mist" : "text-slate"}`}>{copy}</p> : null}
    </div>
  );
}
