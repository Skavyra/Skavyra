export function HeroHeadline({ titleStart, titleAccent }: { titleStart: string; titleAccent: string }) {
  return (
    <h1 className="hero__h a2">
      {titleStart} <span className="hl">{titleAccent}</span>
    </h1>
  );
}
