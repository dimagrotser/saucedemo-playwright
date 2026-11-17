# SauceDemo UI tests

Playwright Test + TypeScript suite for https://www.saucedemo.com.

## Requirements

- Node.js >= 22.18 (`.nvmrc` pins 24)
- Network access to the target site

## Setup

```sh
npm install
npx playwright install chromium
cp .env.example .env   # optional; defaults are built in
```

## Running

```sh
npm test                                  # all tests
npx playwright test tests/cart.spec.ts    # a single file
npx playwright test -g "TC-07"            # a single test by ID
npm run test:headed                       # headed mode
npm run report                            # open the HTML report
npm run typecheck                         # tsc --noEmit
npm run test-cases                        # regenerate test-cases.xlsx
```

Failure artifacts: `test-results/<test>/` holds `trace.zip` and a screenshot; the HTML report is in `playwright-report/`. Open a trace with:

```sh
npx playwright show-trace test-results/<test>/trace.zip
```

Configuration is read from the environment (see `.env.example`): `BASE_URL`, `STANDARD_USER`, `LOCKED_OUT_USER`, `USER_PASSWORD`. Each has a default for the public demo site.

## Test approach

I prioritized by business risk. For a store the path that matters most is the purchase itself: login, catalog, cart, checkout, confirmation. TC-05 runs that whole path, so it's P1.

After that come the things that can stop a customer from buying: a locked account (TC-02), checkout validation (TC-06), and the basic login and cart checks (TC-01, TC-03, TC-04). The drawer (TC-07, TC-08) is an explicit requirement, but it doesn't block a purchase, so it comes next.

The rest is documented but not automated. Price and tax math (TC-11) is easier and more precise to check at the API or unit level than through the UI. TC-09, TC-10, TC-12 and TC-13 are lower risk or already partly covered by the automated tests.

## Test cases

The full plan (requirement, goal, steps, expected result, priority, rationale) is in [test-cases.xlsx](test-cases.xlsx). The workbook is generated from `scripts/generate-test-cases.ts`.

| ID | Title | Automated |
|---|---|---|
| TC-01 | Valid login opens the product catalog | Yes |
| TC-02 | Locked-out user cannot log in and sees an error | Yes |
| TC-03 | Adding and removing a product updates the cart badge and button | Yes |
| TC-04 | Cart lists the selected products with their quantity | Yes |
| TC-05 | Full checkout ends with the order-complete message | Yes |
| TC-06 | Checkout rejects empty shipping details | Yes |
| TC-07 | Burger button opens the drawer with navigation items | Yes |
| TC-08 | Drawer closes with the close button | Yes |
| TC-09 | Login with empty credentials shows a validation error | No |
| TC-10 | A product can be removed from the cart page | No |
| TC-11 | Overview total equals items plus tax | No |
| TC-12 | Logout from the drawer returns to login and protects the catalog | No |
| TC-13 | Cart contents persist across navigation and reload | No |

I wrote the cases from the five product requirements first and opened the site only afterwards, to pick locators.

## Layout

```
tests/       specs, one file per feature area
pages/       page objects (login, inventory incl. drawer, cart, checkout)
fixtures/    test.ts: page-object fixtures and UI login
test-data/   users (from env), products, customer details
scripts/     test-cases.xlsx generator
```

## Assumptions

- saucedemo.com is available and its demo accounts and data are unchanged.
- The cart badge, the drawer and checkout behave the way they did when I inspected the site. The drawer currently also has a "Dynamic Catalog" item. The test ignores it because it isn't in the requirements.
- To run against staging, set `BASE_URL` and the credential variables. As long as the markup and `data-test` attributes are the same, the code doesn't change.

## Design decisions

- Locators: `getByRole` where an accessible name exists, otherwise `data-test` through `getByTestId` (`testIdAttribute` is set to `data-test`).
- There is one CSS selector, `.bm-menu-wrap`. The drawer wrapper has no role or test id, and I need it only to check `aria-hidden`. The reason is in a comment in `pages/inventory.page.ts`.
- Login happens in the `inventoryPage` fixture, so each test gets a fresh context and starts on the catalog. The login tests use `loginPage` directly.
- Page objects exist only where several specs drive the same page. No base page, no component layer.
- Assertions check outcomes the user sees: badge count, item names and quantities, the completion message, error text.

Trade-offs:

- UI login in the fixture costs a page load and a form submit per test, and every test depends on the login page. `storageState` would be faster. I didn't use it here because with 8 tests the time doesn't matter, and I'd rather see a broken login fail loudly.
- For a suite this small, page objects are arguably extra indirection. I kept them because the cart, checkout and drawer steps repeat across specs.
- Chromium only, so cross-browser issues won't show up.

## Known limitations

- The target is a public demo site. If it's slow, down, or changes its markup, tests fail no matter what the code does.
- Eight of thirteen planned cases are automated. TC-09 to TC-13 are documented only.
- Product prices and tax are not asserted (see TC-11).
- Only the standard and locked-out users are used; the site's other demo users (for example `problem_user`, `performance_glitch_user`) are not covered.
- `npm audit` reports a moderate advisory in a transitive dependency of `exceljs`, which is used only by the test-case generator.

## Scaling to a large product / CI

- **Sharding and parallelism.** Tests are independent, so `fullyParallel` is on. In CI, split by `--shard=i/N` across matrix jobs, emit the `blob` reporter, and merge with `npx playwright merge-reports --reporter=html`. Tune `workers` to the runner size.
- **Secrets.** Credentials and `BASE_URL` come from the CI secret store as environment variables; `.env` stays out of git.
- **Setup via API.** Replace UI login with an API call that sets the session, stored per worker through `storageState`, and keep one UI login test. Seed carts through the API for tests that only need a prefilled cart.
- **Tags.** Mark the revenue-critical flows `@smoke` and run them on every PR (`--grep @smoke`); run the full suite on merge and nightly.
- **Retries and flakiness.** Retries are on only in CI (`retries: 2`). Treat a test that passes on retry as flaky: review its trace, reproduce locally with `--repeat-each`, fix the cause, and quarantine with a tracked ticket if it cannot be fixed quickly. Track the flaky rate per test.
- **Test levels.** Move price, tax and total calculation, and field validation rules to unit or API tests. Keep E2E for the few flows that need the whole stack: login, add to cart, checkout, drawer navigation.
- **Environments.** Run against an isolated staging environment with seeded data instead of a shared public service.
- **Failures that only happen in CI.** In CI I'd use trace `on-first-retry`, so any flaky failure leaves a trace, and upload `playwright-report` and `test-results` as job artifacts. Typical differences from local runs are headless mode and viewport, slower runners with more workers, timezone and locale, and network access to the environment. To reproduce, I'd run locally with the same worker count and `--repeat-each`, or open the trace from the CI artifact. There's an example workflow in `.github/workflows/`; the task didn't require it.
