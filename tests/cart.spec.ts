import { expect, test } from '../fixtures/test';
import { products } from '../test-data/products';

test('TC-03: adding and removing a product updates the cart badge and button', async ({ inventoryPage }) => {
  const item = inventoryPage.item(products.backpack);

  await inventoryPage.addToCart(products.backpack);
  await expect(inventoryPage.cartBadge).toHaveText('1');
  await expect(item.getByRole('button', { name: 'Remove' })).toBeVisible();

  await inventoryPage.removeFromCart(products.backpack);
  await expect(inventoryPage.cartBadge).toBeHidden();
  await expect(item.getByRole('button', { name: 'Add to cart' })).toBeVisible();
});

test('TC-04: cart lists the selected products with their quantity', async ({ inventoryPage, cartPage }) => {
  await inventoryPage.addToCart(products.backpack);
  await inventoryPage.addToCart(products.bikeLight);
  await expect(inventoryPage.cartBadge).toHaveText('2');

  await inventoryPage.openCart();

  await expect(cartPage.itemNames()).toHaveText([products.backpack, products.bikeLight]);
  await expect(cartPage.quantity(products.backpack)).toHaveText('1');
  await expect(cartPage.quantity(products.bikeLight)).toHaveText('1');
});
