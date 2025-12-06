// Playwright E2E smoke test for InnovCircuit
// Run with: npx playwright test tests/smoke-test.spec.js --project=chromium

import { test, expect } from '@playwright/test'

test.describe('Smoke E2E - InnovCircuit', () => {
  test('Escenarios críticos: público, compra cliente y verificación admin', async ({ page, request }) => {
    await test.step('Escenario 1: Visitante Público', async () => {
      await page.goto('/')
      await expect(page.getByRole('heading', { name: /Hardware Creativo/i })).toBeVisible()

      const searchInput = page.getByPlaceholder('Buscar productos...')
      await searchInput.fill('Arduino')
      await searchInput.press('Enter')
      const anyCardLink = page.locator('a[href*="/diseno/"]').first()
      await expect(anyCardLink).toBeVisible()
    })

    await test.step('Escenario 2: Flujo de Compra (Cliente)', async () => {
      await page.goto('/login')
      const loginForm = page.locator('form')
      await loginForm.getByLabel('Email').fill('cliente@innovcircuit.com')
      await loginForm.getByLabel('Password').fill('password123')
      await loginForm.getByRole('button', { name: 'Entrar' }).click()
      // Esperar a que se establezca el token en localStorage
      await page.waitForFunction(() => !!window.localStorage.getItem('token'))
      // Confirmar login mostrando elementos de usuario autenticado
      await expect(page.getByRole('button', { name: /Mi Panel/i })).toBeVisible()

      // Obtener primer diseño real desde la API para evitar tarjetas de ejemplo
      const apiResp = await request.get('/api/v1/disenos')
      const lista = await apiResp.json()
      const realId = Array.isArray(lista) && lista.length ? lista[0].id : null
      if (realId) {
        await page.goto(`/diseno/${realId}`)
      } else {
        // Fallback: abrir el primer enlace disponible en la UI
        await page.goto('/')
        const firstDesign = page.locator('a[href*="/diseno/"]').first()
        await firstDesign.click()
      }
      // FIX: Esperar a que la UI reconozca al usuario logueado antes de buscar botones de compra
      await expect(page.getByRole('button', { name: /Mi Panel|Salir/i }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Especificaciones/i })).toBeVisible()
      // El botón sólo aparece para CLIENTE autenticado
      await expect(page.getByRole('button', { name: /Añadir al Carrito/i })).toBeVisible()

      // Añadir al carrito (solo visible para CLIENTE)
      const addToCart = page.getByRole('button', { name: /Añadir al Carrito/i })
      await expect(addToCart).toBeVisible()
      await addToCart.click()

      // Ir al carrito y proceder al pago
      await page.goto('/carrito')
      const checkoutBtn = page.getByRole('button', { name: 'Proceder al Pago' })
      await expect(checkoutBtn).toBeEnabled()
      await checkoutBtn.click()

      // Verificar mensaje de éxito
      await expect(page.getByText(/¡Compra realizada con éxito!/)).toBeVisible()

      // (Opcional) Verificar botón de descarga visible en detalle
      // Nota: la lógica de backend puede requerir permisos para descarga
      await page.goto('/')
      await page.locator('a[href^="/diseno/"]').first().click()
      await expect(page.getByRole('button', { name: /Descargas/i })).toBeVisible()

      // Verificar sección "Mis Pedidos" (impresión)
      await page.goto('/dashboard/pedidos')
      await expect(page.getByRole('heading', { name: 'Mis Pedidos de Impresión' })).toBeVisible()
    })

    await test.step('Escenario 3: Verificación Administrativa', async () => {
      // Cerrar sesión desde el header
      const logoutBtn = page.getByRole('button', { name: 'Salir' })
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click()
      } else {
        // fallback: ir manualmente a login
        await page.goto('/login')
      }

      // Login como Admin
      await page.getByLabel('Email').fill('admin@innovcircuit.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Entrar' }).click()

      // Ir al Dashboard de Admin
      await page.goto('/admin')
      await expect(page.getByText('Panel de Administración')).toBeVisible()
      await expect(page.getByText('Ventas Globales')).toBeVisible()

      // Ir a la sección de Pedidos (Admin)
      await page.goto('/admin/pedidos')
      await expect(page.getByText(/Gestionar Pedidos/i)).toBeVisible()
    })
  })
})
