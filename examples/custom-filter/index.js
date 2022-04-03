import fs from 'fs';
import { Selector } from 'testcafe';

fixture`Custom Filter`.page`https://www.aa.com/homePage.do?locale=en_US`;

test('Record all JSON requests', async t => {
  await t.click(Selector('.optoutmulti_button'));
  await t.expect(Selector('.aa-logo').exists).ok();
  await t.expect(Selector('#aa-footer').exists).ok();
}).after(async t => {
  await t.expect(fs.existsSync('examples/custom-filter/tmp')).ok();
});
