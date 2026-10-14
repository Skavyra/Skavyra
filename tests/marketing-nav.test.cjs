const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadTs(relativePath) {
  const filename = path.resolve(relativePath);
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  compiled._compile(outputText, filename);
  return compiled.exports;
}

const { isMarketingNavLinkActive } = loadTs('src/lib/marketing-nav.ts');
const links = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/contact?topic=college', label: 'For colleges' },
  { href: '/about#mentors', label: 'Mentors' },
  { href: '/about', label: 'About' },
];
const activeLabels = (pathname, hash = '') => links
  .filter((link) => isMarketingNavLinkActive(link, links, pathname, hash))
  .map((link) => link.label);

test('About is the only active item on /about without a hash', () => {
  assert.deepEqual(activeLabels('/about'), ['About']);
});

test('Mentors is the only active item on /about#mentors', () => {
  assert.deepEqual(activeLabels('/about', '#mentors'), ['Mentors']);
});

test('course subpages keep Courses active without activating Home', () => {
  assert.deepEqual(activeLabels('/courses/data-analytics'), ['Courses']);
});

test('selecting Home after visiting About and Mentors activates only Home', () => {
  const routeSequence = [
    ['/about', ''],
    ['/about', '#mentors'],
    ['/', ''],
  ];
  const results = routeSequence.map(([pathname, hash]) => activeLabels(pathname, hash));
  assert.deepEqual(results, [['About'], ['Mentors'], ['Home']]);
});

test('each marketing destination maps to one active link', () => {
  const destinations = [
    ['/', ''],
    ['/courses', ''],
    ['/contact', ''],
    ['/about', '#mentors'],
    ['/about', ''],
  ];
  destinations.forEach(([pathname, hash]) => {
    assert.equal(activeLabels(pathname, hash).length, 1, `${pathname}${hash} should have exactly one active link`);
  });
});
