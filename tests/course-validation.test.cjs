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
  const originalRequire = compiled.require.bind(compiled);
  compiled.require = (name) => name.startsWith('.')
    ? loadTs(path.resolve(path.dirname(filename), `${name}.ts`))
    : originalRequire(name);
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  compiled._compile(outputText, filename);
  return compiled.exports;
}

const { courseSchema, courseValidationError } = loadTs('src/lib/validations/course.ts');
const { formToObject } = loadTs('src/lib/validations/common.ts');
const base = {
  title: 'Python', slug: 'python', category: 'it', level: 'beginner',
  price: '1000', mrp: '', duration_weeks: '', sort_order: '0',
};

test('installments off: real FormData with no hidden payment field is valid', () => {
  const form = new FormData();
  for (const [key, value] of Object.entries(base)) form.set(key, value);
  form.set('allows_partial', '');
  const raw = formToObject(form);
  assert.equal(Object.hasOwn(raw, 'min_first_payment'), false);
  const parsed = courseSchema.parse({ ...raw, allows_partial: false });
  assert.equal(parsed.min_first_payment, null);
  assert.equal(parsed.price, 1000);
});

test('optional numeric fields accept blank, whitespace, missing, and null values', () => {
  for (const value of ['', '  ', undefined, null]) {
    const parsed = courseSchema.parse({ ...base, allows_partial: true, mrp: value, duration_weeks: value, min_first_payment: value });
    assert.equal(parsed.mrp, null);
    assert.equal(parsed.duration_weeks, null);
    assert.equal(parsed.min_first_payment, null);
  }
});

test('installment minimum accepts zero and valid numeric strings', () => {
  for (const value of ['0', '250.50']) {
    assert.equal(courseSchema.parse({ ...base, allows_partial: true, min_first_payment: value }).min_first_payment, Number(value));
  }
});

test('invalid optional numbers report which field needs correcting', () => {
  const cases = [
    ['mrp', 'not money', 'MRP:'],
    ['mrp', '500', 'MRP:'],
    ['duration_weeks', 'two weeks', 'Duration in weeks:'],
    ['duration_weeks', '0', 'Duration in weeks:'],
    ['duration_weeks', '1.5', 'Duration in weeks:'],
    ['min_first_payment', '-10', 'Smallest first payment:'],
    ['min_first_payment', 'abc', 'Smallest first payment:'],
    ['min_first_payment', 'Infinity', 'Smallest first payment:'],
  ];
  for (const [field, value, label] of cases) {
    const result = courseSchema.safeParse({ ...base, allows_partial: true, [field]: value });
    assert.equal(result.success, false, `${field} should reject ${value}`);
    assert.ok(courseValidationError(result.error).startsWith(label));
  }
});

test('course marketing content remains optional', () => {
  const parsed = courseSchema.parse({ ...base, allows_partial: false, learning_outcomes: '', target_audience: '', prerequisites: '', projects: '', mentor_bio: '' });
  for (const field of ['learning_outcomes', 'target_audience', 'prerequisites', 'projects', 'mentor_bio']) assert.equal(parsed[field], null);
});
