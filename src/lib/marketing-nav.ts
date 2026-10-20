export type MarketingNavLink = { href: string; label: string };

function splitHref(href: string) {
  const path = href.split(/[?#]/, 1)[0] || "/";
  const hash = href.includes("#") ? `#${href.split("#")[1].split("?")[0]}` : "";
  const beforeHash = href.split("#", 1)[0];
  const query = beforeHash.includes("?") ? beforeHash.slice(beforeHash.indexOf("?") + 1) : "";
  return { path, hash, query };
}

function queryMatches(linkQuery: string, currentSearch: string) {
  const expected = new URLSearchParams(linkQuery);
  const current = new URLSearchParams(currentSearch);
  return [...expected.entries()].every(([key, value]) => current.getAll(key).includes(value));
}

export function isMarketingNavLinkActive(
  link: MarketingNavLink,
  links: MarketingNavLink[],
  pathname: string,
  currentHash: string,
  currentSearch: string = "",
) {
  const { path, hash, query } = splitHref(link.href);

  if (query) return pathname === path && queryMatches(query, currentSearch);

  const queryDestinationIsActive = links.some((candidate) => {
    const candidateHref = splitHref(candidate.href);
    return candidateHref.path === path && Boolean(candidateHref.query) && queryMatches(candidateHref.query, currentSearch);
  });
  if (queryDestinationIsActive) return false;

  if (hash) return pathname === path && currentHash === hash;

  const hashDestinationIsActive = links.some((candidate) => {
    const candidateHref = splitHref(candidate.href);
    return candidateHref.path === path && Boolean(candidateHref.hash) && currentHash === candidateHref.hash;
  });

  return (pathname === path && !hashDestinationIsActive)
    || (path !== "/" && pathname.startsWith(`${path}/`));
}
