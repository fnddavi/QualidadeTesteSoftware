// tests/pages/ContactsPage.ts
import { Page, expect } from '@playwright/test';

export class ContactsPage {
  constructor(private page: Page) {}

  async create(name: string, phone: string) {
    await this.page.getByTestId('create-name').fill(name);
    await this.page.getByTestId('create-phone').fill(phone);

    const createResp = this.page.waitForResponse(
      (r) => r.url().endsWith('/contacts') && r.request().method() === 'POST'
    );
    await this.page.getByTestId('create-submit').click();
    await createResp;

    await expect(this.page.getByText(name)).toBeVisible();
    await expect(this.page.getByText(phone)).toBeVisible();
  }

  async editByVisibleText(oldName: string, newName: string, newPhone: string) {
    // 1) encontre o cartão com o nome atual
    const itemWithOldName = this.page.locator('li.item', { hasText: oldName }).first();
    await itemWithOldName.waitFor();

    // 2) clique no botão editar desse cartão
    await itemWithOldName.getByTestId(/^edit-/).click();

    // 3) depois do clique, o texto "Alice" some; então
    //    relocalize o <li> que ESTÁ em modo de edição:
    //    é o <li> que contém um botão "save-..." (ou "cancel-edit-...")
    const editingLi = this.page
      .locator('li.item')
      .filter({ has: this.page.getByTestId(/^save-/) })
      .first();

    // garanta que estamos no cartão certo (modo de edição ativo)
    await expect(editingLi).toBeVisible();

    // 4) pegue os inputs desse <li> (serão exatamente 2)
    const inputs = editingLi.locator('input');
    await expect(inputs).toHaveCount(2, { timeout: 8000 });

    const editName = inputs.nth(0);
    const editPhone = inputs.nth(1);

    await editName.fill(newName);
    await editPhone.fill(newPhone);

    // 5) clique em salvar e espere o PUT /contacts/:id
    const saveResp = this.page.waitForResponse(
      (r) => r.url().includes('/contacts/') && r.request().method() === 'PUT'
    );
    await editingLi.getByTestId(/^save-/).click();
    await saveResp;

    // 6) valida a atualização na UI
    await expect(this.page.getByText(newName)).toBeVisible();
    await expect(this.page.getByText(newPhone)).toBeVisible();
  }

  async deleteByVisibleText(name: string) {
    const item = this.page.locator('li.item', { hasText: name }).first();
    await item.waitFor();

    const delResp = this.page.waitForResponse(
      (r) => r.url().includes('/contacts/') && r.request().method() === 'DELETE'
    );
    await item.getByTestId(/^delete-/).click(); // confirm() já é tratado no spec
    await delResp;

    await expect(item).toHaveCount(0);
  }

  async refresh() {
    await this.page.getByTestId('btn-refresh').click();
  }

  async expectEmptyList() {
    await expect(this.page.getByText('Nenhum contato ainda.')).toBeVisible();
  }
}
