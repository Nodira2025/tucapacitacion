# Tu Capacitación

Sitio institucional en Astro. HTML generado durante el build, componentes reutilizables, imágenes WebP y fuentes locales. Dominio: **https://www.tucapacitacion.com**.

## Trabajar en el proyecto

Node.js 22.12 o superior (recomendado Node 24 LTS).

```sh
npm install
npm run dev
```

En PowerShell, usar `npm.cmd` si la política de ejecución bloquea `npm.ps1`. El desarrollo abre en `http://127.0.0.1:4321`.

```sh
npm run check
npm run build
npm test
npm run preview
```

Para las pruebas de navegación y accesibilidad, con Google Chrome instalado, iniciar `npm run preview -- --port 4322` en una terminal y ejecutar `npm run test:browser` en otra. Se prueban los borradores de WhatsApp con una respuesta simulada, sin enviar mensajes. `npm run format` da formato al código.

## Contenido

- `src/data/courses.ts`: catálogo y destacados. Cada curso genera una página propia.
- `src/data/site.ts`: contactos, dirección, redes y dominio de referencia.
- `src/data/faqs.ts`: respuestas públicas y datos estructurados coincidentes.
- `src/layouts/BaseLayout.astro`: navegación, pie y metadatos comunes.
- `src/styles/`: diseño responsive y accesible, sin frameworks de CSS.
- `src/assets/`: imágenes originales; Astro genera los formatos y tamaños necesarios.
- `legacy/`: archivos anteriores preservados como referencia, excluidos del sitio publicado.

Los cursos guardados se conservan localmente; las consultas preparan mensajes en WhatsApp. No se procesan pagos ni se confirma inscripción desde la web. No hay scripts externos de publicidad ni analítica activados. El evento local `lead_intent` prepara su futura integración y representa únicamente una intención de contacto.

## Publicar

Publicar **el contenido de `dist/`**, nunca la raíz del repositorio. Netlify tiene configuración en `netlify.toml`; otros hosts estáticos pueden servir la misma carpeta. Configurar los redireccionamientos 301 de `public/_redirects` en el proveedor elegido. También se incluyen páginas HTML de redirección como respaldo para hosting estático. Ver [SEO y publicación](docs/SEO-Y-PUBLICACION.md).

La fotografía de portada proviene de la misma imagen de Unsplash utilizada por la web anterior. Las fotografías de cursos provienen del repositorio original y son ilustrativas. Las condiciones de inscripción se conservaron íntegramente; revisar las ambigüedades comerciales documentadas antes de actualizar la oferta.
