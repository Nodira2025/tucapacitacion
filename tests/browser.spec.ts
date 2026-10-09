import { test, expect, type Page, type Route } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const storageKey = 'tuCapacitacionCart';
const runtimeErrors = new WeakMap<Page, string[]>();
const whatsappMock =
  '<!doctype html><html lang="es"><head><title>WhatsApp simulado</title></head><body><p>Borrador interceptado: no se envió ningún mensaje.</p></body></html>';

async function fulfillWhatsApp(route: Route) {
  await route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: whatsappMock });
}

async function visit(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-enhanced', 'true');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
}

test.beforeEach(async ({ page, context }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  // The context handler also intercepts the initial request of a new popup.
  // No test sends data to WhatsApp, Maps, analytics, or any external server.
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    if (url.hostname === 'wa.me') return fulfillWhatsApp(route);
    return route.abort('blockedbyclient');
  });
});

test.afterEach(async ({ page }) => {
  expect(
    runtimeErrors.get(page) || [],
    'La página no debe producir errores de JavaScript.',
  ).toEqual([]);
});

test('el catálogo encuentra Programación al buscar sin acento desde la URL', async ({ page }) => {
  await visit(page, '/cursos/?q=programacion');
  await expect(page.getByRole('searchbox', { name: 'Buscá tu próximo curso' })).toHaveValue(
    'programacion',
  );
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 3, name: 'Programación', exact: true }),
  ).toBeVisible();
  await expect(page.locator('#course-result-count')).toHaveText('1 curso encontrado de 20');
  await page.getByRole('searchbox', { name: 'Buscá tu próximo curso' }).fill('PROGRAMACIÓN');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { level: 3, name: 'Programación', exact: true }),
  ).toBeVisible();
});

test('el filtro por área conserva los resultados al recargar', async ({ page }) => {
  await visit(page, '/cursos/');
  await page.getByLabel('Área de formación').selectOption('Técnica');
  await expect(page.getByRole('article')).toHaveCount(3);
  for (const name of ['Reparación de Celulares', 'Técnico en Refrigeración', 'Electricidad']) {
    await expect(page.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  }
  await expect(
    page.getByRole('heading', { level: 3, name: 'Programación', exact: true }),
  ).toBeHidden();
  expect(new URL(page.url()).searchParams.get('area')).toBe('Técnica');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel('Área de formación')).toHaveValue('Técnica');
  await expect(page.getByRole('article')).toHaveCount(3);
});

test('una búsqueda sin coincidencias se puede limpiar y recuperar todo el catálogo', async ({
  page,
}) => {
  await visit(page, '/cursos/');
  await page
    .getByRole('searchbox', { name: 'Buscá tu próximo curso' })
    .fill('zzsincoincidenciaszz');
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Probemos por otro camino.' })).toBeVisible();
  await expect(page.locator('#course-result-count')).toHaveText('0 cursos encontrados de 20');
  await page.getByRole('button', { name: 'Ver todos los cursos' }).click();
  await expect(page.getByRole('article')).toHaveCount(20);
  await expect(page.getByRole('searchbox', { name: 'Buscá tu próximo curso' })).toHaveValue('');
  await expect(page.getByRole('searchbox', { name: 'Buscá tu próximo curso' })).toBeFocused();
  expect(new URL(page.url()).searchParams.has('q')).toBe(false);
  await page.getByLabel('Área de formación').selectOption('Salud');
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await expect(page.getByLabel('Área de formación')).toHaveValue('');
  await expect(page.getByRole('article')).toHaveCount(20);
});

test('guardar un curso persiste entre páginas y recargas; el diálogo permite quitarlo y cerrar con Escape', async ({
  page,
}) => {
  await visit(page, '/cursos/?q=programacion');
  await page.getByRole('button', { name: 'Guardar Programación', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Quitar Programación', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Programación', exact: true }).click();
  await expect(page).toHaveURL(/\/cursos\/programacion\/$/);
  await expect(
    page.getByRole('button', { name: 'Quitar de mis guardados: Programación', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('button', { name: 'Quitar de mis guardados: Programación', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const trigger = page.getByRole('button', { name: /Ver mis cursos guardados/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Tus cursos guardados' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Programación', exact: true })).toHaveAttribute(
    'href',
    '/cursos/programacion/',
  );
  const draft = await dialog
    .getByRole('link', { name: 'Consultar por WhatsApp' })
    .getAttribute('href');
  expect(new URL(draft!).searchParams.get('text')).toContain('Programación');
  await dialog.getByRole('button', { name: 'Quitar Programación', exact: true }).click();
  await expect(dialog.getByText(/Todavía no guardaste cursos/)).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Consultar por WhatsApp' })).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Guardar este curso: Programación', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), storageKey),
  ).toEqual([]);
});

test('recupera la selección del carrito anterior sin conservar un precio obsoleto', async ({
  page,
}) => {
  await visit(page, '/');
  await page.evaluate(
    (key) => localStorage.setItem(key, JSON.stringify([{ name: 'Programación', price: 45000 }])),
    storageKey,
  );
  await visit(page, '/cursos/');
  await expect(
    page.getByRole('button', { name: 'Quitar Programación', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('button', { name: 'Guardar Secretario Administrativo', exact: true })
    .click();
  const persisted = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    storageKey,
  );
  expect(persisted).toEqual(
    expect.arrayContaining([
      { name: 'Programación', slug: 'programacion' },
      { name: 'Secretario Administrativo', slug: 'secretario-administrativo' },
    ]),
  );
  expect(persisted).toHaveLength(2);
  await page.getByRole('button', { name: /Ver mis cursos guardados/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Tus cursos guardados' });
  await expect(dialog.getByRole('link', { name: 'Programación', exact: true })).toBeVisible();
  await expect(dialog).not.toContainText('45000');
});

test('un JSON corrupto en el carrito no bloquea búsqueda ni guardado', async ({ page }) => {
  await visit(page, '/');
  await page.evaluate((key) => localStorage.setItem(key, '{json-invalido'), storageKey);
  await visit(page, '/cursos/?q=programacion');
  await expect(
    page.getByRole('heading', { level: 3, name: 'Programación', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Guardar Programación', exact: true }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('button', { name: 'Quitar Programación', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Ver mis cursos guardados/ }).click();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Programación', exact: true }),
  ).toBeVisible();
});

test('contacto valida los datos y prepara el borrador sin enviar mensajes', async ({
  page,
  context,
}) => {
  await page.route('https://wa.me/**', fulfillWhatsApp);
  await visit(page, '/contacto/');
  const submit = page.getByRole('button', { name: 'Continuar en WhatsApp' });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByLabel('Nombre completo *', { exact: true })).toBeFocused();
  await expect(page.locator('#contact-status')).toBeHidden();
  expect(context.pages()).toHaveLength(1);
  await page.getByLabel('Nombre completo *', { exact: true }).fill('Ana Prueba');
  await page.getByLabel('Correo electrónico *', { exact: true }).fill('correo-invalido');
  await page.getByLabel('Área de interés *', { exact: true }).selectOption('Informática');
  await page
    .getByLabel('Tu consulta *', { exact: true })
    .fill('Quiero conocer el programa del curso. Prueba local.');
  await submit.click();
  await expect(page.getByLabel('Correo electrónico *', { exact: true })).toBeFocused();
  await expect(page.locator('#contact-status')).toBeHidden();
  expect(context.pages()).toHaveLength(1);
  await page.getByLabel('Correo electrónico *', { exact: true }).fill('prueba@example.com');
  const popupPromise = context.waitForEvent('page');
  await submit.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup.getByText('Borrador interceptado: no se envió ningún mensaje.')).toBeVisible();
  const draftUrl = new URL(popup.url());
  expect(draftUrl.hostname).toBe('wa.me');
  expect(draftUrl.pathname).toBe('/5493855140883');
  expect(draftUrl.searchParams.get('text')).toContain('Ana Prueba');
  expect(draftUrl.searchParams.get('text')).toContain('prueba@example.com');
  expect(draftUrl.searchParams.get('text')).toContain('Informática');
  await expect(page.locator('#contact-status')).toContainText('Tu consulta está preparada.');
  await expect(page.getByRole('link', { name: 'Abrir el mensaje en WhatsApp' })).toHaveAttribute(
    'href',
    popup.url(),
  );
  await expect(page.getByLabel('Tu consulta *', { exact: true })).toHaveValue(
    'Quiero conocer el programa del curso. Prueba local.',
  );
  await popup.close();
});

test('postulación valida los campos y conserva la presentación en el enlace alternativo', async ({
  page,
  context,
}) => {
  await page.route('https://wa.me/**', fulfillWhatsApp);
  await visit(page, '/trabaja-con-nosotros/');
  const submit = page.getByRole('button', { name: 'Preparar mi postulación' });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByLabel('Nombre completo *', { exact: true })).toBeFocused();
  await expect(page.locator('#job-status')).toBeHidden();
  expect(context.pages()).toHaveLength(1);
  await page.getByLabel('Nombre completo *', { exact: true }).fill('Alex Prueba');
  await page
    .getByLabel('Puesto o área de interés *', { exact: true })
    .fill('Docente de Informática');
  await page
    .getByLabel('Breve presentación *', { exact: true })
    .fill('Presentación de prueba local para verificar el formulario.');
  const popupPromise = context.waitForEvent('page');
  await submit.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup.getByText('Borrador interceptado: no se envió ningún mensaje.')).toBeVisible();
  const draftUrl = new URL(popup.url());
  expect(draftUrl.hostname).toBe('wa.me');
  expect(draftUrl.pathname).toBe('/5493855140883');
  expect(draftUrl.searchParams.get('text')).toContain('Alex Prueba');
  expect(draftUrl.searchParams.get('text')).toContain('Docente de Informática');
  expect(draftUrl.searchParams.get('text')).toContain('Presentación de prueba local');
  await expect(page.locator('#job-status')).toContainText('Tu presentación está preparada.');
  await expect(
    page.getByRole('link', { name: 'Abrir mi presentación en WhatsApp' }),
  ).toHaveAttribute('href', popup.url());
  await popup.close();
});

for (const width of [375, 768]) {
  for (const path of ['/', '/cursos/', '/cursos/programacion/', '/contacto/']) {
    test(`sin desbordamiento horizontal a ${width}px: ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await visit(page, path);
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(
        dimensions.viewport + 1,
      );
      expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(
        dimensions.viewport + 1,
      );
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }
}

test('el menú móvil se puede abrir, recorrer y cerrar con teclado', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await visit(page, '/');
  const toggle = page.getByLabel('Abrir menú de navegación');
  const navigation = page.getByRole('navigation', { name: 'Navegación móvil' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    navigation.getByRole('link', { name: 'Nuestros cursos', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/cursos\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('las preguntas frecuentes se abren y cierran con teclado', async ({ page }) => {
  await visit(page, '/');
  const question = page
    .locator('summary')
    .filter({ hasText: '¿Cómo puedo inscribirme en un curso?' });
  const answer = page.getByText('Elegí el curso que te interesa y consultanos por WhatsApp.', {
    exact: false,
  });
  await expect(answer).toBeHidden();
  await question.focus();
  await page.keyboard.press('Enter');
  await expect(answer).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(answer).toBeHidden();
});

test('la galería amplía las imágenes ilustrativas y devuelve el foco al cerrar', async ({
  page,
}) => {
  await visit(page, '/galeria/');
  await expect(
    page.getByText(/no muestran las instalaciones, docentes ni estudiantes/),
  ).toBeVisible();
  const opener = page.getByRole('link', { name: 'Ampliar imagen ilustrativa: Formación en salud' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Formación en salud · Imagen ilustrativa' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img')).toHaveAttribute(
    'alt',
    'Imagen ilustrativa del área de farmacia',
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

const accessibilityRoutes = [
  ['inicio', '/'],
  ['catálogo', '/cursos/'],
  ['curso', '/cursos/programacion/'],
  ['área', '/areas/salud/'],
  ['contacto', '/contacto/'],
  ['instituto', '/instituto/'],
  ['sede', '/sedes/'],
  ['galería', '/galeria/'],
  ['términos', '/terminos-y-condiciones/'],
  ['trabajo', '/trabaja-con-nosotros/'],
] as const;

for (const [name, path] of accessibilityRoutes) {
  test(`accesibilidad WCAG A/AA: ${name}`, async ({ page }, testInfo) => {
    await visit(page, path);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const violations = results.violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }));
    await testInfo.attach(`axe-${name}.json`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });
    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
  });
}

async function capture(page: Page, path: string, file: string, foldFile?: string) {
  await visit(page, path);
  await page.evaluate(() => document.fonts.ready);
  // Scroll through lazy images so the full-page reference contains real assets.
  for (const picture of await page.locator('img').all()) {
    if (await picture.isVisible()) await picture.scrollIntoViewIfNeeded();
  }
  await expect
    .poll(() =>
      page.locator('img').evaluateAll((images) =>
        images.every((element) => {
          const image = element as HTMLImageElement;
          return image.complete && image.naturalWidth > 0;
        }),
      ),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  if (foldFile) await page.screenshot({ path: foldFile, fullPage: false, animations: 'disabled' });
}

test('capturas completas de inicio desktop, móvil y catálogo', async ({ page }) => {
  test.setTimeout(90_000);
  await mkdir('artifacts', { recursive: true });
  await capture(page, '/', 'artifacts/desktop-home.png', 'artifacts/desktop-fold.png');
  await page.setViewportSize({ width: 375, height: 900 });
  await capture(page, '/', 'artifacts/mobile-home.png', 'artifacts/mobile-fold.png');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await capture(page, '/cursos/', 'artifacts/desktop-catalog.png');
});

test('las animaciones se pueden pausar y la elección persiste', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await visit(page, '/');
  const home = page.locator('.human-home');
  await expect(home).toHaveAttribute('data-motion', 'running');
  await page.getByRole('button', { name: 'Pausar animaciones' }).click();
  await expect(home).toHaveAttribute('data-motion', 'paused');
  await expect
    .poll(() =>
      page.locator('.h-brand-path').evaluate((el) => getComputedStyle(el).animationPlayState),
    )
    .toBe('paused');
  await page.reload();
  await expect(home).toHaveAttribute('data-motion', 'paused');
  await page.getByRole('button', { name: 'Activar animaciones' }).click();
  await expect(home).toHaveAttribute('data-motion', 'running');
});

test('la preferencia de movimiento reducido detiene las animaciones', async ({ page }) => {
  await visit(page, '/');
  await expect(page.locator('.human-home')).toHaveAttribute('data-motion', 'paused');
  await expect(page.getByRole('button', { name: 'Movimiento reducido' })).toBeDisabled();
  await expect
    .poll(() => page.locator('.h-brand-path').evaluate((el) => getComputedStyle(el).animationName))
    .toBe('none');
});

test('el contenido y los enlaces principales funcionan sin JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.course-card')).toHaveCount(4);
  await expect(page.locator('.b-motion')).toBeHidden();
  await expect
    .poll(() => page.locator('.h-brand-path').evaluate((el) => getComputedStyle(el).animationName))
    .toBe('none');
  await page.locator('.h-hero .h-primary').click();
  await expect(page).toHaveURL(/\/cursos\/$/);
  await expect(page.locator('.course-card')).toHaveCount(20);
  await context.close();
});

test('la búsqueda de inicio lleva al catálogo filtrado', async ({ page }) => {
  await visit(page, '/');
  await page.getByRole('searchbox', { name: 'Buscá un curso', exact: true }).fill('programacion');
  await page.getByRole('button', { name: 'Buscar curso', exact: true }).click();
  await expect(page).toHaveURL(/\/cursos\/\?q=programacion/);
  await expect(page.locator('.course-card:visible')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Programación', exact: true })).toBeVisible();
});

test('las áreas de inicio muestran los cursos y permiten abrir su ficha', async ({ page }) => {
  await visit(page, '/');
  const technical = page
    .locator('.n-area-card')
    .filter({ has: page.locator('summary strong', { hasText: 'Técnica' }) });
  await technical.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(technical).toHaveAttribute('open', '');
  await expect(technical.getByRole('link', { name: 'Electricidad', exact: true })).toBeVisible();
  await technical.getByRole('link', { name: 'Electricidad', exact: true }).click();
  await expect(page).toHaveURL(/\/cursos\/electricidad\/$/);
});
