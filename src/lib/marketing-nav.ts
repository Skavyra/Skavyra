export type MarketingNavLink = { href: string; label: string };

function splitHref(href: string) {
  const path = href.split(/[?#]/, 1)[0] || "/";
  const hash = href.includes("#") ? `#${href.split("#")[1].split("?")[0]}` : "";
  return { path, hash };
}

export function isMarketingNavLinkActive(
  link: MarketingNavLink,
  links: MarketingNavLink[],
  pathname: string,
  currentHash: string,
) {
  const { path, hash } = splitHref(link.href);

  if (hash) return pathname === path && currentHash === hash;

  const hashDestinationIsActive = links.some((candidate) => {
    const candidateHref = splitHref(candidate.href);
    return candidateHref.path === path && Boolean(candidateHref.hash) && currentHash === candidateHref.hash;
  });

  return (pathname === path && !hashDestinationIsActive)
    || (path !== "/" && pathname.startsWith(`${path}/`));
}
