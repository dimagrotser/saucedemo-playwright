import { expect, test } from '../fixtures/test';
import { users } from '../test-data/users';

test('TC-01: valid login opens the product catalog', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard);

  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByTestId('inventory-item')).not.toHaveCount(0);
});

test('TC-02: locked-out user cannot log in and sees an error', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.lockedOut);

  await expect(loginPage.error).toContainText('this user has been locked out');
  await expect(page).not.toHaveURL(/inventory\.html/);
});
