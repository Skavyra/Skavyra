/** A single quarter circle from the mark, used as the icon on course cards. */
export function Quarter({ className, fill = "#DDAA2F" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M0 40A40 40 0 0 1 40 0V40Z" fill={fill} />
    </svg>
  );
}
