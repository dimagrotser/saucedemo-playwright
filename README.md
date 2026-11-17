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

The cases were derived from the five product requirements, not from browsing the site. The site was inspected afterwards to choose locators.

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
- The cart badge, the drawer and checkout behave as of the inspection date. The drawer currently also lists a "Dynamic Catalog" item; the test does not assert on it because it is not part of the stated requirements.
- For a staging environment, set `BASE_URL` and the credential variables; no code change is needed if the markup and `data-test` attributes match.

## Design decisions

- Locators: `getByRole` where an accessible name exists, otherwise `data-test` through `getByTestId` (`testIdAttribute` is set to `data-test`).
- One non-semantic selector: the drawer wrapper (`.bm-menu-wrap`) has no role or test id. It is used only to assert `aria-hidden`, with a comment in `pages/inventory.page.ts`.
- Login goes through the `inventoryPage` fixture, so each test starts from a fresh context already on the catalog. Login tests use `loginPage` directly.
- Page objects exist where several specs drive the same page. There is no base page and no component layer.
- Assertions target outcomes: badge count, item names and quantities, the completion message, error text.

Trade-offs:

- UI login in the fixture adds a page load and a form submit to every test and couples every test to the login page. `storageState` would be faster but shares one login path and hides login regressions from most tests.
- Page objects add indirection for a suite this small. They are kept because cart, checkout and drawer steps repeat across specs.
- Chromium only. Cross-browser issues will not be caught.

## Known limitations

- The target is an external demo service: it can be slow, change markup, or be unavailable, which fails tests regardless of the code.
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
