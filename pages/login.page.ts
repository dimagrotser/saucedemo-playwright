import type { Locator, Page } from '@playwright/test';

export interface Credentials {
  username: string;
  password: string;
}

export class LoginPage {
  readonly error: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.error = page.getByTestId('error');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login({ username, password }: Credentials): Promise<void> {
    await this.page.getByTestId('username').fill(username);
    await this.page.getByTestId('password').fill(password);
    await this.loginButton.click();
  }
}
