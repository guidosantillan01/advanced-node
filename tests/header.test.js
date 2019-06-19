const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');
const Page = require('./helpers/page');

jest.setTimeout(10000); // To fix: Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout. problem

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close(); // browser.close()
});

test('should expect header has correct text', async () => {
  const text = await page.$eval('a.brand-logo', el => el.innerHTML);

  expect(text).toEqual('Blogster');
});

test('should start oauth flow after clicking login', async () => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/); // regex expression
});

test('should show logout button when signed in', async () => {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await page.setCookie({ name: 'session', value: session });
  await page.setCookie({ name: 'session.sig', value: sig });
  await page.goto('localhost:3000');
  await page.waitFor('a[href="/auth/logout"]');

  const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

  expect(text).toEqual('Logout');
});
