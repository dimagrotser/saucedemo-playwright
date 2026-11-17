import type { Locator, Page } from '@playwright/test';

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  readonly error: Locator;
  readonly overviewItems: Locator;
  readonly completeHeader: Locator;

  constructor(private readonly page: Page) {
    this.error = page.getByTestId('error');
    this.overviewItems = page.getByTestId('inventory-item-name');
    this.completeHeader = page.getByTestId('complete-header');
  }

  async fillShipping({ firstName, lastName, postalCode }: ShippingDetails): Promise<void> {
    await this.page.getByTestId('firstName').fill(firstName);
    await this.page.getByTestId('lastName').fill(lastName);
    await this.page.getByTestId('postalCode').fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async finish(): Promise<void> {
    await this.page.getByRole('button', { name: 'Finish' }).click();
  }
}
