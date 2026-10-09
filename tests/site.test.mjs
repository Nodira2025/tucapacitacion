import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const site = new URL(process.env.SITE_URL || 'https://www.tucapacitacion.com');
const requiredRoutes = [
  '/',
  '/cursos/',
  '/instituto/',
  '/contacto/',
  '/sedes/',
  '/galeria/',
  '/trabaja-con-nosotros/',
  '/terminos-y-condiciones/',
  '/areas/administracion/',
  '/areas/oficios-tecnicos/',
  '/areas/informatica/',
  '/areas/belleza/',
  '/areas/salud/',
];

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  });
}

function decode(value) {
  const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (_, entity) => {
    if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith('#')) return String.fromCodePoint(parseInt(entity.slice(1), 10));
    return entities[entity.toLowerCase()];
  });
}

function attributes(markup) {
  return Object.fromEntries(
    [...markup.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map((match) => [
      match[1].toLowerCase(),
      decode(match[2] ?? match[3] ?? match[4]),
    ]),
  );
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, 'gi'))].map((match) =>
    attributes(match[1]),
  );
}

function routeFor(filename) {
  const relative = path.relative(dist, filename).split(path.sep).join('/');
  return `/${relative.replace(/(^|\/)index\.html$/, '$1')}`;
}

function meta(page, key) {
  return tags(page.html, 'meta').filter((tag) => tag.name === key || tag.property === key);
}

function canonical(page) {
  return tags(page.html, 'link').filter((tag) =>
    (tag.rel || '').split(/\s+/).includes('canonical'),
  );
}

function localFile(url) {
  const pathname = decodeURIComponent(url.pathname);
  const filename = path.resolve(dist, `.${pathname}`);
  assert.ok(
    filename === dist || filename.startsWith(`${dist}${path.sep}`),
    `Ruta fuera de dist: ${url.href}`,
  );
  if (existsSync(filename) && statSync(filename).isFile()) return filename;
  const index = path.join(filename, 'index.html');
  if (existsSync(index) && statSync(index).isFile()) return index;
  return null;
}

const allFiles = filesIn(dist);
const pages = allFiles
  .filter((file) => file.endsWith('.html'))
  .map((filename) => ({
    filename,
    route: routeFor(filename),
    html: readFileSync(filename, 'utf8'),
  }));
const indexable = pages.filter(
  (page) => !meta(page, 'robots').some((tag) => /\bnoindex\b/i.test(tag.content || '')),
);
const pageByFile = new Map(pages.map((page) => [page.filename, page]));

test('el build incluye todas las páginas y veinte fichas de cursos', () => {
  assert.ok(existsSync(dist), 'Falta dist. Ejecutá npm run build antes de npm test.');
  for (const route of requiredRoutes) {
    assert.ok(
      indexable.some((page) => page.route === route),
      `Falta página indexable: ${route}`,
    );
  }
  const courses = indexable.filter((page) => /^\/cursos\/[^/]+\/$/.test(page.route));
  assert.equal(courses.length, 20, 'El catálogo debe generar las veinte fichas publicadas.');
  const source = readFileSync(path.join(root, 'src/data/courses.ts'), 'utf8');
  const courseRoutes = [...source.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)].map(
    (match) => `/cursos/${match[1]}/`,
  );
  assert.equal(courseRoutes.length, 20, 'La fuente de datos debe conservar los veinte cursos.');
  assert.deepEqual(
    courses.map((page) => page.route).sort(),
    courseRoutes.sort(),
    'Las fichas deben corresponder al catálogo fuente.',
  );
  assert.ok(
    pages.some((page) => page.route === '/404.html'),
    'Falta la página 404.',
  );
});

test('cada página indexable tiene identidad SEO completa y un solo h1', () => {
  assert.ok(indexable.length > 0, 'No se encontraron páginas indexables.');
  const canonicalUrls = [];
  for (const page of indexable) {
    const label = page.route;
    assert.equal(tags(page.html, 'html')[0]?.lang, 'es', `${label}: falta lang="es".`);
    const titles = [...page.html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
    assert.equal(titles.length, 1, `${label}: debe haber un title.`);
    assert.ok(decode(titles[0][1]).trim(), `${label}: title vacío.`);
    const description = meta(page, 'description');
    assert.equal(description.length, 1, `${label}: debe haber una meta description.`);
    assert.ok(description[0].content?.trim(), `${label}: description vacía.`);
    assert.equal(tags(page.html, 'h1').length, 1, `${label}: debe haber un solo h1.`);
    const links = canonical(page);
    assert.equal(links.length, 1, `${label}: debe haber una canonical.`);
    const url = new URL(links[0].href);
    assert.equal(url.protocol, 'https:', `${label}: canonical sin HTTPS.`);
    assert.equal(url.origin, site.origin, `${label}: dominio canonical incorrecto.`);
    assert.equal(
      url.href,
      new URL(page.route, site).href,
      `${label}: canonical no coincide con su ruta.`,
    );
    canonicalUrls.push(url.href);
    for (const key of ['og:title', 'og:description', 'og:url', 'og:image']) {
      assert.equal(meta(page, key).length, 1, `${label}: falta ${key} o está duplicado.`);
      assert.ok(meta(page, key)[0].content?.trim(), `${label}: ${key} vacío.`);
    }
    assert.equal(
      meta(page, 'og:url')[0].content,
      url.href,
      `${label}: og:url debe coincidir con canonical.`,
    );
  }
  assert.equal(new Set(canonicalUrls).size, canonicalUrls.length, 'Hay URLs canonical duplicadas.');
});

test('enlaces, anclas y recursos locales apuntan a archivos generados', () => {
  const errors = [];
  function check(reference, from, checkAnchor = false) {
    if (!reference || /^(?:data|mailto|tel|javascript|blob):/i.test(reference)) return;
    let url;
    try {
      url = new URL(decode(reference), new URL(from, site));
    } catch {
      errors.push(`${from}: URL inválida ${reference}`);
      return;
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== site.origin) return;
    let target;
    try {
      target = localFile(url);
    } catch (error) {
      errors.push(`${from}: ${error.message}`);
      return;
    }
    if (!target) {
      errors.push(`${from}: no existe ${reference}`);
      return;
    }
    if (checkAnchor && url.hash && url.hash !== '#') {
      const targetPage = pageByFile.get(target);
      if (!targetPage) return;
      let anchor;
      try {
        anchor = decodeURIComponent(url.hash.slice(1));
      } catch {
        errors.push(`${from}: ancla inválida ${reference}`);
        return;
      }
      // Text fragments are resolved by the browser, not by element IDs.
      anchor = anchor.split(':~:text=')[0];
      if (!anchor) return;
      const targets = [...targetPage.html.matchAll(/<[a-z][\w:-]*\b([^>]*)>/gi)].map((match) =>
        attributes(match[1]),
      );
      if (!targets.some((tag) => tag.id === anchor || tag.name === anchor)) {
        errors.push(`${from}: no existe el ancla ${reference}`);
      }
    }
  }
  for (const page of pages) {
    for (const match of page.html.matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)) {
      const tag = attributes(match[2]);
      for (const attribute of ['href', 'src', 'poster']) {
        if (tag[attribute]) check(tag[attribute], page.route, attribute === 'href');
      }
      if (tag.srcset && !tag.srcset.startsWith('data:')) {
        for (const candidate of tag.srcset.split(','))
          check(candidate.trim().split(/\s+/)[0], page.route);
      }
      if (tag.property === 'og:image' || tag.name === 'twitter:image')
        check(tag.content, page.route);
    }
  }
  for (const file of allFiles.filter((file) => file.endsWith('.css'))) {
    const route = `/${path.relative(dist, file).split(path.sep).join('/')}`;
    for (const match of readFileSync(file, 'utf8').matchAll(
      /url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/gi,
    )) {
      check(match[1], route);
    }
  }
  assert.deepEqual(errors, [], errors.join('\n'));
});

test('JSON-LD válido, sin valoraciones, precios ni métricas sin evidencia', () => {
  const forbiddenKeys = new Set([
    'aggregateRating',
    'ratingValue',
    'ratingCount',
    'reviewCount',
    'bestRating',
    'worstRating',
    'price',
    'lowPrice',
    'highPrice',
    'priceCurrency',
    'interactionStatistic',
    'numberOfStudents',
    'totalHistoricalEnrollment',
  ]);
  for (const page of indexable) {
    const blocks = [...page.html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(
      (match) => attributes(match[1]).type === 'application/ld+json',
    );
    assert.ok(blocks.length > 0, `${page.route}: falta JSON-LD.`);
    const types = [];
    function walk(value) {
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      if (!value || typeof value !== 'object') return;
      for (const [key, child] of Object.entries(value)) {
        assert.ok(!forbiddenKeys.has(key), `${page.route}: dato sin respaldo en JSON-LD: ${key}.`);
        if (key === '@type') types.push(...(Array.isArray(child) ? child : [child]));
        walk(child);
      }
    }
    for (const block of blocks) {
      let json;
      assert.doesNotThrow(() => {
        json = JSON.parse(block[2]);
      }, `${page.route}: JSON-LD inválido.`);
      walk(json);
    }
    assert.ok(
      !types.includes('AggregateRating'),
      `${page.route}: no publicar valoraciones sin evidencia.`,
    );
    if (/^\/cursos\/[^/]+\/$/.test(page.route)) {
      assert.ok(types.includes('Course'), `${page.route}: la ficha debe declarar Course.`);
    }
  }
});

test('sitemap y robots publican las canonical y excluyen 404', () => {
  const sitemapFiles = allFiles.filter((file) => /^sitemap.*\.xml$/.test(path.basename(file)));
  assert.ok(sitemapFiles.length > 0, 'Falta sitemap.xml o un índice de sitemaps.');
  const urls = sitemapFiles.flatMap((file) => {
    const xml = readFileSync(file, 'utf8');
    if (/<sitemapindex\b/i.test(xml)) return [];
    return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => decode(match[1].trim()));
  });
  assert.ok(urls.length > 0, 'El sitemap no incluye URLs.');
  assert.equal(new Set(urls).size, urls.length, 'El sitemap contiene URLs duplicadas.');
  const expected = indexable.map((page) => canonical(page)[0]?.href).sort();
  assert.deepEqual(
    [...urls].sort(),
    expected,
    'El sitemap debe enumerar exactamente las páginas indexables.',
  );
  assert.ok(
    urls.every((url) => !/\/404(?:\.html)?\/?$/.test(new URL(url).pathname)),
    'La 404 no debe estar en el sitemap.',
  );
  const errorPage = pages.find((page) => page.route === '/404.html');
  assert.ok(
    errorPage && meta(errorPage, 'robots').some((tag) => /\bnoindex\b/i.test(tag.content || '')),
    'La 404 debe declarar noindex.',
  );
  const robotsFile = path.join(dist, 'robots.txt');
  assert.ok(existsSync(robotsFile), 'Falta robots.txt.');
  const robots = readFileSync(robotsFile, 'utf8');
  assert.match(robots, /^User-agent:\s*\*/im, 'Falta regla general de robots.');
  assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/im, 'robots.txt está bloqueando todo el sitio.');
  const declared = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((match) => new URL(match[1]));
  assert.ok(declared.length > 0, 'robots.txt debe enlazar el sitemap.');
  for (const url of declared) {
    assert.equal(url.origin, site.origin, 'robots.txt declara otro dominio.');
    assert.equal(url.protocol, 'https:');
    assert.ok(localFile(url), `Sitemap de robots inexistente: ${url.href}`);
  }
});
