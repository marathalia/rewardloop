const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
function load(file, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText
  const context = { exports: {}, ...globals }
  vm.runInNewContext(code, context)
  return context.exports
}
const validation = load('lib/campaign-validation.ts')
const base = Object.fromEntries(['headline', 'posterKicker', 'posterBadge', 'inApp', 'push', 'sms', 'emailSubject', 'emailBody', 'cta', 'visualDirection', 'rationale'].map(key => [key, 'Selected for you']))
test('equivalent amounts pass; invented amounts, percentages and units fail', () => {
  for (const [text, value, passes] of [['Worth $12.00', '$12', true], ['Worth S$12', '$12', true], ['Worth $120', '$12', false], ['Worth $12/day', '$12', false], ['Save 20%', '20% off', true], ['Save 50%', '20% off', false], ['Partner-funded reward', '$12', false], ['', '$12', false]]) {
    assert.equal(validation.campaignValidationIssues({ ...base, inApp: text }, value).length === 0, passes, text)
  }
  assert.equal(validation.campaignValidationIssues({ ...base, rationale: 'No funding claims were used.' }, '$12').length, 0)
})
function handler(drafts, key = 'test-placeholder') {
  const calls = []
  const route = load('app/api/generate/route.ts', {
    process: { env: { OPENAI_API_KEY: key } },
    require: name => {
      if (name === 'next/server') return { NextResponse: { json: body => body } }
      if (name.endsWith('campaign-validation')) return validation
      if (name.endsWith('event-store')) return { appendRewardLoopEvent: async () => {} }
      if (name.endsWith('mvp-engine')) return { getReward: () => ({ id: 'test', name: 'Dessert', value: '$12', merchant: 'Berry Lane', availability: 'Available', approvedClaims: ['$12'], terms: 'Demo only' }) }
      throw new Error(name)
    },
    fetch: async (_url, options) => {
      calls.push(JSON.parse(options.body))
      const draft = drafts[Math.min(calls.length - 1, drafts.length - 1)]
      return { ok: true, json: async () => ({ output: [{ content: [{ type: 'output_text', text: JSON.stringify(draft) }] }] }) }
    },
  })
  return { run: () => route.POST({ json: async () => ({ rewardId: 'test' }) }), calls }
}
test('rejected copy receives one corrective retry and can recover', async () => {
  const { run, calls } = handler([{ ...base, push: 'Worth $120' }, { ...base, push: 'Worth $12.00' }])
  const result = await run()
  assert.equal(calls.length, 2)
  assert.match(calls[1].input, /CORRECTIONS REQUIRED/)
  assert.match(result.provider, /OpenAI/)
  assert.equal(result.guardrailStatus, 'passed')
  assert.equal(result.warning, undefined)
})
test('two rejected drafts display an honest template status', async () => {
  const { run, calls } = handler([{ ...base, push: 'Worth $120' }])
  const result = await run()
  assert.equal(calls.length, 2)
  assert.equal(result.provider, 'Template copy')
  assert.equal(result.guardrailStatus, 'template')
  assert.match(result.warning, /push: use only the catalogue amount/)
})
test('missing key uses template without calling OpenAI', async () => {
  const { run, calls } = handler([], '')
  const result = await run()
  assert.equal(calls.length, 0)
  assert.equal(result.guardrailStatus, 'template')
})
