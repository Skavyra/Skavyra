export function HeroHeadline({ titleStart, titleAccent }: { titleStart: string; titleAccent: string }) {
  const firstLine = `${titleStart} `;
  const reveal = (text: string, offset: number) =>
    [...text].map((character, index) => (
      <span key={offset + index} data-hero-char>
        {character}
      </span>
    ));

  return (
    <h1
      data-hero-headline
      aria-label={`${titleStart} ${titleAccent}`}
      className="mt-7 max-w-[15ch] text-fluid-hero font-bold tracking-[-0.035em] sm:max-w-none"
    >
      <span aria-hidden="true">{reveal(firstLine, 0)}</span>
      <br className="hidden sm:block" />
      <span aria-hidden="true" className="text-gold-300">
        {reveal(titleAccent, firstLine.length)}
      </span>
    </h1>
  );
}
