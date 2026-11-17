import { expect, test } from '../fixtures/test';

test('TC-07: burger button opens the drawer with navigation items', async ({ page, inventoryPage }) => {
  await expect(inventoryPage.drawer).toHaveAttribute('aria-hidden', 'true');

  await inventoryPage.openMenuButton.click();

  await expect(inventoryPage.drawer).toHaveAttribute('aria-hidden', 'false');
  await expect(page.getByRole('button', { name: 'All Items' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset App State' })).toBeVisible();
});

test('TC-08: drawer closes with the close button', async ({ page, inventoryPage }) => {
  await inventoryPage.openMenuButton.click();
  await expect(inventoryPage.drawer).toHaveAttribute('aria-hidden', 'false');

  await inventoryPage.closeMenuButton.click();

  await expect(inventoryPage.drawer).toHaveAttribute('aria-hidden', 'true');
  await expect(page.getByRole('button', { name: 'Logout' })).toBeHidden();
});
