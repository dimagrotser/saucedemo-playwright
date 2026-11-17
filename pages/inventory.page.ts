import type { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly items: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly openMenuButton: Locator;
  readonly closeMenuButton: Locator;
  // The drawer wrapper has no role or test id; aria-hidden on it is the open/closed signal.
  readonly drawer: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.closeMenuButton = page.getByRole('button', { name: 'Close Menu' });
    this.drawer = page.locator('.bm-menu-wrap');
  }

  item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  addToCart(name: string): Promise<void> {
    return this.item(name).getByRole('button', { name: 'Add to cart' }).click();
  }

  removeFromCart(name: string): Promise<void> {
    return this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
