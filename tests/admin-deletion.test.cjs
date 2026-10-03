const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const actorId = '10000000-0000-4000-8000-000000000001';
const targetId = '10000000-0000-4000-8000-000000000002';
const inheritorId = '10000000-0000-4000-8000-000000000003';

// Exercise server-action authorization/error handling without mutating a live DB.
// SQL RLS and RPC behavior still require integration checks after migration.
function setup(file, options = {}) {
  const calls = [];
  const user = options.denied ? null : { id: actorId, profile: { is_active: !options.inactive } };
  const client = {
    from(table) {
      calls.push(['table', table]);
      if (table === 'enrollments') return { select: () => ({ eq: async () => ({ count: options.enrollments ?? 0, error: options.readError ?? null }) }) };
      if (table === 'courses') return {
        select: () => ({ eq: () => ({ single: async () => ({ data: options.missing ? null : { published_at: options.publishedAt ?? null }, error: options.readError ?? null }) }) }),
        update: (values) => ({ eq: async (_column, id) => {
          calls.push(['update', id, values]);
          return { error: options.updateError ?? null };
        } }),
        delete: () => {
        calls.push(['delete']);
        return { eq: (_column, id) => {
          calls.push(['courseId', id]);
          return { select: () => ({ maybeSingle: async () => ({ data: options.missing ? null : { id }, error: options.deleteError ?? null }) }) };
        } };
      } };
      throw new Error(`Unexpected table ${table}`);
    },
    async rpc(name, args) { calls.push(['rpc', name, args]); return { error: options.rpcError ?? null }; },
  };
  const mocks = {
    'next/cache': { revalidatePath: (value) => calls.push(['revalidate', value]) },
    '@/lib/auth/require-role': { currentUserWithRole: async (role) => { assert.equal(role, 'admin'); return user; } },
    '@/lib/supabase/server': { createClient: async () => client },
    '@/lib/edge': {},
    '@/lib/utils': {},
    '@/lib/validations/common': { optionalPhone: require('zod').z.string().optional(), optionalText: require('zod').z.string().optional() },
    '@/lib/validations/course': {},
    '@/lib/validations/staff': {},
  };
  const filename = path.resolve(file);
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = compiled.require.bind(compiled);
  compiled.require = (name) => Object.hasOwn(mocks, name) ? mocks[name] : originalRequire(name);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  compiled._compile(outputText, filename);
  return { actions: compiled.exports, calls };
}

test('course details can be published without any modules or lessons', async () => {
  const { actions, calls } = setup('src/actions/courses.ts');
  assert.equal((await actions.setCourseStatus(targetId, 'published')).ok, true);
  const update = calls.find(([name]) => name === 'update');
  assert.equal(update[1], targetId);
  assert.equal(update[2].status, 'published');
  assert.ok(Number.isFinite(Date.parse(update[2].published_at)));
  assert.ok(!calls.some(([name, table]) => name === 'table' && table !== 'courses'));
  assert.ok(calls.some(([name, route]) => name === 'revalidate' && route === '/courses/[slug]'));
});

test('republishing preserves the original publication date', async () => {
  const publishedAt = '2026-10-01T12:00:00.000Z';
  const { actions, calls } = setup('src/actions/courses.ts', { publishedAt });
  assert.equal((await actions.setCourseStatus(targetId, 'published')).ok, true);
  assert.equal(calls.find(([name]) => name === 'update')[2].published_at, publishedAt);
});

test('publishing still rejects unauthorized, missing, and failed database requests', async () => {
  for (const options of [{ denied: true }, { missing: true }, { readError: { message: 'Read failed' } }, { updateError: { message: 'Write failed' } }]) {
    const { actions, calls } = setup('src/actions/courses.ts', options);
    assert.equal((await actions.setCourseStatus(targetId, 'published')).ok, false);
    assert.ok(!calls.some(([name]) => name === 'revalidate'));
    if (!options.updateError) assert.ok(!calls.some(([name]) => name === 'update'));
  }
});

test('course delete rejects non-admins, inactive admins, and invalid IDs without database writes', async () => {
  for (const options of [{ denied: true }, { inactive: true }, {}]) {
    const { actions, calls } = setup('src/actions/courses.ts', options);
    const result = await actions.deleteCourse(Object.keys(options).length ? targetId : 'invalid');
    assert.equal(result.ok, false);
    assert.deepEqual(calls, []);
  }
});

test('enrolled courses and failed enrollment checks never reach delete', async () => {
  for (const options of [{ enrollments: 1 }, { readError: { message: 'Permission denied' } }]) {
    const { actions, calls } = setup('src/actions/courses.ts', options);
    assert.equal((await actions.deleteCourse(targetId)).ok, false);
    assert.ok(!calls.some(([name]) => name === 'delete'));
  }
});

test('database FK errors and invisible rows are not reported as deletion success', async () => {
  for (const options of [{ deleteError: { code: '23503', message: 'FK constraint' } }, { missing: true }]) {
    const { actions, calls } = setup('src/actions/courses.ts', options);
    assert.equal((await actions.deleteCourse(targetId)).ok, false);
    assert.ok(!calls.some(([name]) => name === 'revalidate'));
  }
});

test('successful course deletion targets the requested ID and refreshes public pages', async () => {
  const { actions, calls } = setup('src/actions/courses.ts');
  assert.equal((await actions.deleteCourse(targetId)).ok, true);
  assert.ok(calls.some(([name, id]) => name === 'courseId' && id === targetId));
  assert.ok(calls.some(([name, route]) => name === 'revalidate' && route === '/courses/[slug]'));
});

test('employee removal blocks unauthorized, inactive, self, and malformed requests', async () => {
  for (const [options, id, inheritor] of [[{ denied: true }, targetId, null], [{ inactive: true }, targetId, null], [{}, actorId, null], [{}, 'invalid', null], [{}, targetId, 'invalid']]) {
    const { actions, calls } = setup('src/actions/staff.ts', options);
    assert.equal((await actions.removeEmployee(id, inheritor)).ok, false);
    assert.deepEqual(calls, []);
  }
});

test('employee removal invokes one RPC and never sends a caller-controlled actor', async () => {
  for (const inheritor of [null, inheritorId]) {
    const { actions, calls } = setup('src/actions/staff.ts');
    assert.equal((await actions.removeEmployee(targetId, inheritor)).ok, true);
    assert.deepEqual(calls.find(([name]) => name === 'rpc'), ['rpc', 'remove_employee', { p_user_id: targetId, ...(inheritor ? { p_reassign_to: inheritor } : {}) }]);
  }
});

test('employee removal surfaces transactional errors without refreshing success state', async () => {
  const { actions, calls } = setup('src/actions/staff.ts', { rpcError: { message: 'Admin accounts cannot be removed here' } });
  assert.deepEqual(await actions.removeEmployee(targetId, null), { ok: false, error: 'Admin accounts cannot be removed here' });
  assert.ok(!calls.some(([name]) => name === 'revalidate'));
});
