import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry } from '../src/lib/enquiry';
function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({ name: 'Alex Smith', phone: '07700 900123', email: 'alex@example.com', registration: 'ab12 cde', service: 'Servicing', urgency: 'I have a specific date', date: '2026-11-10', message: 'Annual service please.', ...overrides }).forEach(([key, value]) => data.set(key, value));
  return data;
}
test('valid enquiry is normalised; preferred date may be omitted', () => {
  assert.equal(validateEnquiry(form(), '2026-10-28').registration, 'AB12 CDE');
  assert.equal(validateEnquiry(form({ urgency: 'I’m flexible', date: '' }), '2026-10-28').date, '');
});
test('rejects missing or malformed contact details and header injection', () => {
  for (const input of [{ name: '' }, { name: 'Alex\r\nBcc: victim@example.com' }, { email: 'bad' }, { email: 'a@example.com\r\nBcc: b@example.com' }, { phone: '-------' }]) assert.throws(() => validateEnquiry(form(input), '2026-10-28'));
});
test('rejects oversized messages, unsupported services and invalid dates', () => {
  for (const input of [{ message: 'x'.repeat(3001) }, { service: 'Unknown' }, { date: '2026-02-30' }, { date: '2025-01-01' }]) assert.throws(() => validateEnquiry(form(input), '2026-10-28'));
});
