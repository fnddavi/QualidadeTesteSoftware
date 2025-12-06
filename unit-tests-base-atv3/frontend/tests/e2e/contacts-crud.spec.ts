// tests/e2e/contacts-crud.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ContactsPage } from '../pages/ContactsPage';

// sufixo aleatório para evitar conflito de usuário
const rand = () => Math.random().toString(36).slice(2, 8);

test.setTimeout(60_000);

test.describe('CRUD de Contatos (E2E)', () => {
  test('Registrar, logar, criar, listar, editar e excluir contato', async ({ page }) => {
    // handler global para qualquer alert()/confirm()
    page.on('dialog', async (dlg) => {
      // console.log(`Dialog (${dlg.type()}): ${dlg.message()}`);
      await dlg.accept();
    });

    const login = new LoginPage(page);
    const contacts = new ContactsPage(page);

    const username = `user_${rand()}`;
    const password = 'senhaSegura123';
    const phone1 = '11987654321';
    const phone2 = '11912345678';

    // ---- ABRE APP ----
    await login.goto();

    // ---- CADASTRO (espera 201 + alert) ----
    const regRespPromise = page.waitForResponse(
      (resp) => resp.url().endsWith('/users') && resp.request().method() === 'POST'
    );
    const regAlertPromise = page.waitForEvent('dialog'); // "Usuário criado! Faça login."
    await login.register(username, password);
    const [regResp] = await Promise.all([regRespPromise, regAlertPromise]);
    expect(regResp.status()).toBe(201);

    // ---- LOGIN (espera 200) ----
    const loginRespPromise = page.waitForResponse(
      (resp) => resp.url().endsWith('/users/login') && resp.request().method() === 'POST'
    );
    await login.login(username, password);
    const loginResp = await loginRespPromise;
    expect(loginResp.ok()).toBeTruthy();

    // ---- LISTA INICIAL ----
    await contacts.refresh();
    await contacts.expectEmptyList();

    // ---- CREATE ----
    await contacts.create('Alice', phone1);

    // ---- EDIT ----
    await contacts.editByVisibleText('Alice', 'Alice Santos', phone2);

    // ---- DELETE ----
    await contacts.deleteByVisibleText('Alice Santos');

    // ---- LISTA VAZIA ----
    await contacts.expectEmptyList();

    // ---- LOGOUT ----
    await login.logout();
  });
});
