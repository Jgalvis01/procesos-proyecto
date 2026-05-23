import { test, expect, type Page } from '@playwright/test'

const managerEmail = process.env.TEST_MANAGER_EMAIL ?? 'manager.test@gmail.com'
const managerPassword = process.env.TEST_MANAGER_PASSWORD ?? 'Manager123!'

async function loginAsManager(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Correo electr\u00f3nico').fill(managerEmail)
  await page.getByLabel('Contrase\u00f1a').fill(managerPassword)
  await page.getByRole('button', { name: 'Iniciar Sesi\u00f3n', exact: true }).click()

  const errorHeading = page.getByRole('heading', { name: 'Error' })
  const outcome = await Promise.race([
    page.waitForURL('**/dashboard', { timeout: 30000 }).then(() => 'dashboard'),
    errorHeading.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'error')
  ]).catch(() => 'timeout')

  if (outcome === 'error') {
    const errorMessage = await page.locator('.text-red-700').first().textContent()
    throw new Error(`Login failed: ${errorMessage?.trim() || 'unknown error'}`)
  }

  if (outcome === 'timeout') {
    throw new Error('Login did not navigate to /dashboard and no error was shown within 30s.')
  }
}

test.describe('TC-PRU-002 - Validacion de permisos de eliminacion para rol manager', () => {
  test('manager ve Editar y no ve Eliminar en productos', async ({ page }) => {
    await loginAsManager(page)

    await page.getByRole('link', { name: 'Productos', exact: true }).click()
    await page.waitForURL('**/products')
    await expect(page.getByRole('heading', { name: 'Lista de Productos' })).toBeVisible()

    const loadingText = page.getByText('Cargando productos...')
    if (await loadingText.isVisible()) {
      await expect(loadingText).toBeHidden()
    }

    const productRows = page.locator('ul.divide-y > li')
    if (await productRows.count() === 0) {
      await page.getByRole('link', { name: 'Nuevo Producto' }).click()
      await page.waitForURL('**/products/create')

      const uniqueSuffix = Date.now().toString().slice(-6)
      await page.getByLabel('C\u00f3digo del producto *').fill(`TST${uniqueSuffix}`)
      await page.getByLabel('Nombre del producto *').fill(`Producto Playwright ${uniqueSuffix}`)
      await page.getByLabel('Precio *').fill('1000')
      await page.getByLabel('Stock Inicial *').fill('5')
      await page.getByRole('button', { name: 'Crear Producto' }).click()

      await expect(page.getByText('Producto creado exitosamente')).toBeVisible()
      await page.goto('/products')
      await expect(page.getByRole('heading', { name: 'Lista de Productos' })).toBeVisible()
      const loadingAfterCreate = page.getByText('Cargando productos...')
      if (await loadingAfterCreate.isVisible()) {
        await expect(loadingAfterCreate).toBeHidden()
      }
    }

    const firstRow = page.locator('ul.divide-y > li').first()
    await expect(firstRow).toBeVisible()
    await expect(firstRow.getByRole('link', { name: 'Editar' })).toBeVisible()
    await expect(firstRow.getByRole('button', { name: 'Eliminar' })).toHaveCount(0)
  })
})
