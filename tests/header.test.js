const Page = require('./helpers/page');

let page;

jest.setTimeout(10000); // To fix: Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout. problem

beforeEach(async () => {
  page = await Page.build(); // here is the proxy
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await page.close(); // browser.close()
});

test('should expect header has correct text', async () => {
  const text = await page.getContentsOf('a.brand-logo'); // getContentOf custom function

  expect(text).toEqual('Blogster');
});

test('should start oauth flow after clicking login', async () => {
  await page.click('.right a');

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/); // regex expression
});

test('should show logout button when signed in', async () => {
  await page.login();

  const text = await page.getContentsOf('a[href="/auth/logout"]');

  expect(text).toEqual('Logout');
});
