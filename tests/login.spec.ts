import { expect, test } from '../fixtures/test';
import { InventoryPage } from '../pages/inventory.page';
import { users } from '../test-data/users';

test('TC-01: valid login opens the product catalog', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard);

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(new InventoryPage(page).items).not.toHaveCount(0);
});

test('TC-02: locked-out user cannot log in and sees an error', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.lockedOut);

  await expect(loginPage.error).toContainText('this user has been locked out');
  await expect(loginPage.loginButton).toBeVisible();
  await expect(page).toHaveURL('/');
});
