import { expect, test } from '../fixtures/test';
import { customer } from '../test-data/customer';
import { products } from '../test-data/products';

test('TC-05: full checkout ends with the order-complete message', async ({
  page,
  inventoryPage,
  cartPage,
  checkoutPage,
}) => {
  await inventoryPage.addToCart(products.boltTShirt);
  await inventoryPage.openCart();
  await cartPage.checkout();

  await checkoutPage.fillShipping(customer);
  await checkoutPage.continue();
  await expect(checkoutPage.overviewItems).toHaveText([products.boltTShirt]);

  await checkoutPage.finish();
  await expect(page).toHaveURL(/checkout-complete\.html/);
  await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  await expect(inventoryPage.cartBadge).toBeHidden();
});

test('TC-06: checkout rejects empty shipping details', async ({ page, inventoryPage, cartPage, checkoutPage }) => {
  await inventoryPage.addToCart(products.backpack);
  await inventoryPage.openCart();
  await cartPage.checkout();

  await checkoutPage.continue();

  await expect(checkoutPage.error).toHaveText('Error: First Name is required');
  await expect(page).toHaveURL(/checkout-step-one\.html/);
});
