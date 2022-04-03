import fs from 'fs';
import { Selector } from 'testcafe';

fixture`Default`.page`https://www.etihad.com/en/`;

test('Record all JSON requests', async t => {
  await t.click(Selector('#onetrust-accept-btn-handler'));
  await t.expect(Selector('.header-text-logo').exists).ok();
  await t.expect(Selector('.footer').exists).ok();
}).after(async t => {
  await t.expect(fs.existsSync('examples/default/tmp')).ok();
});
