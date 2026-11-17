import type { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly items: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId('inventory-item');
  }

  itemNames(): Locator {
    return this.items.getByTestId('inventory-item-name');
  }

  quantity(name: string): Locator {
    return this.items.filter({ hasText: name }).getByTestId('item-quantity');
  }

  async checkout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }
}
