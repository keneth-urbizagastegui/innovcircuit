import { test, expect } from '@playwright/test'

test.describe('Dashboard Cliente - Generar Reporte', () => {
  test('abre el modal y muestra contenido del reporte', async ({ page }) => {
    // Login como cliente
    await page.goto('/login')
    const form = page.locator('form')
    await form.getByLabel('Email').fill('cliente@innovcircuit.com')
    await form.getByLabel('Password').fill('password123')
    await Promise.all([
      page.waitForResponse(r => r.url().endsWith('/api/v1/auth/login') && r.status() === 200),
      form.getByRole('button', { name: 'Entrar' }).click(),
    ])
    await page.waitForFunction(() => !!window.localStorage.getItem('token'))

    // Ir al dashboard del cliente y esperar estado autenticado
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: /Mi Panel/i })).toBeVisible({ timeout: 10000 })

    // Click en Generar Reporte
    const generarBtn = page.getByRole('button', { name: /Generar Reporte/i })
    await expect(generarBtn).toBeVisible()
    await generarBtn.click()

    // Verificar que el modal abre y contiene tabla de reporte
    await expect(page.getByRole('heading', { name: 'Reporte de Compras' })).toBeVisible()
    const tabla = page.locator('table')
    await expect(tabla).toBeVisible()

    // Verificar que el footer tiene botón Cerrar
    await expect(page.getByRole('button', { name: 'Cerrar' })).toBeVisible()
  })
})

