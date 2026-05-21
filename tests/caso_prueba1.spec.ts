// ovp
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;


const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

test.beforeEach(async ({ page }) => {
  await supabase
    .from('producto')
    .update({ stock: 3 })
    .eq('id', 19);

  //sign in
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill('oscar@mail.com');
  await page.getByLabel('Contraseña').fill('12345');
  await page.getByRole('button', { name: 'Iniciar Sesión',exact:true}).click();

  //go to sales
  await page.getByText('Nueva Venta').click();
  await expect(page).toHaveURL('/sales/create');

  //Add 3 gaseosas under client Rui
  await page.getByPlaceholder('Buscar cliente').fill("Rui");
  await expect(page.getByText('TI: 11111111')).toBeVisible();
  await page.getByText('TI: 11111111').click();
  await page.getByPlaceholder('Buscar productos').fill('Gaseosa');
  await expect(page.getByText('Código: 54')).toBeVisible();
  await page.getByText('Código: 54').click();
  await expect(page.getByText('CANTIDAD')).toBeVisible();
  for (let i: number = 1; i < 3; i++) {
    await page.getByText('+').click();
  }
});

test('3-buy-gaseosa',async({page})=>{
  await expect(page.getByText('Total (3 items)'));
  await page.getByText('Finalizar Venta').click();
  await expect(page).toHaveURL('sales');
}); test('4-buy-gaseosa',async({page})=>{
  await page.getByText('+').click();
  await expect(page.getByText('Stock insuficiente. Stock disponible: 3')).toBeVisible();
  await page.getByText('Cancelar').click();
  await expect(page).toHaveURL('/dashboard');
});