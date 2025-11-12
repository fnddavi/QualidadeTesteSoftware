// tests/pages/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByText('Acesse sua conta')).toBeVisible();
  }

  async register(username: string, password: string) {
    await this.page.getByTestId('register-username').fill(username);
    await this.page.getByTestId('register-password').fill(password);
    await this.page.getByTestId('register-submit').click();
    // (o spec espera o response 201 e o alert)
  }

  async login(username: string, password: string) {
    await this.page.getByTestId('login-username').fill(username);
    await this.page.getByTestId('login-password').fill(password);
    await this.page.getByTestId('login-submit').click();

    // elementos estáveis pós-login
    await expect(this.page.getByTestId('btn-refresh')).toBeVisible();
    await expect(this.page.getByTestId('btn-logout')).toBeVisible();
    await expect(this.page.getByText('Seus contatos')).toBeVisible();
  }

  async logout() {
    await this.page.getByTestId('btn-logout').click();
    await expect(this.page.getByText('Acesse sua conta')).toBeVisible();
  }
}
