# Tu Capacitación: arquitectura y publicación

La landing y las páginas institucionales se generan como HTML estático con Astro (SSG). El contenido principal se entrega sin depender de JavaScript para su lectura o indexación. El catálogo comparte una fuente de datos en `src/data/courses.ts` y genera veinte fichas con URL propia; los estilos, componentes y metadatos se reutilizan para mantener una identidad moderna, elegante y cercana, con el logo y los colores azul y rojo de la institución.

## Desarrollo y validación

Requiere Node.js 22.12 o posterior. Desde la raíz del proyecto:

```sh
npm install
npm run dev
npm run check
npm run build
npm test
npm run preview
```

`dev` inicia el sitio local; `check` revisa Astro y TypeScript; `build` genera `dist/`; `test` verifica ese resultado, por lo que debe ejecutarse después del build. Las pruebas comprueban rutas, las veinte fichas, metadatos, canonical, idioma, un único h1 por página, enlaces y anclas locales, recursos, JSON-LD, sitemap y robots. `preview` permite revisar el build antes de publicarlo. La inspección visual y las consultas reales por WhatsApp siguen necesitando una comprobación manual.

El dominio definitivo confirmado es **https://www.tucapacitacion.com**. `SITE_URL` usa ese valor como predeterminado en `astro.config.mjs`; `.env.example` documenta la variable. El valor debe ser una URL absoluta con HTTPS y coincidir con el dominio de producción al construir el sitio. Las canonical, los metadatos sociales y el sitemap deben apuntar a ese dominio, aun cuando se revise una URL temporal de despliegue.

## Búsqueda y datos estructurados

Cada página tiene título y descripción, URL canonical y metadatos para compartir. Las fichas incluyen datos estructurados `Course` basados en el contenido visible. El sitemap enumera las páginas canónicas y excluye la 404, que declara `noindex`.

Se retiraron del contenido promocional precios, duraciones, promesas de certificación y métricas que no contaban con evidencia suficiente. No se publican valoraciones, cantidades de egresados ni resultados inventados. Para incorporar esos datos se necesita confirmación de la institución y consistencia entre el contenido visible y sus datos estructurados. Los términos y condiciones se preservaron: sus referencias contradictorias a siete y nueve cuotas, y las disposiciones sobre devoluciones, requieren revisión de la institución antes de modificarlas.

Google indica que sus funciones de búsqueda con IA se apoyan en los fundamentos de SEO y no exigen archivos especiales ni marcado exclusivo. La estructura accesible, el contenido útil y verificable, los enlaces internos y la coherencia institucional ayudan a que los buscadores comprendan el sitio. No hay un archivo mágico que garantice aparecer en respuestas de IA, ni se puede prometer posicionamiento o recomendaciones. Fuente: [funciones de IA y tu sitio web, Google Search Central](https://developers.google.com/search/docs/appearance/ai-features?hl=es).

## Consultas y anuncios

Los enlaces de contacto preparan un evento `lead_intent` en `window.dataLayer`. Representa el clic y la intención de consultar: **no confirma un mensaje enviado, un contacto recibido, una inscripción ni una venta**. No debe utilizarse como venta confirmada en informes o estrategias de puja. No se incluyen nombres, teléfonos ni contenido privado de mensajes en el evento.

No hay campañas, identificadores de Google Analytics 4, Google Tag Manager o Google Ads activados. Publicar la página no inicia anuncios ni genera gasto publicitario. La institución deberá facilitar y autorizar las cuentas y los identificadores cuando corresponda; la atribución de una inscripción real requiere una fuente de confirmación independiente.

## Lista de publicación

1. Ejecutar `npm run check`, `npm run build` y `npm test`; revisar escritorio y móvil, el catálogo, las fichas, el menú, el contacto, la navegación con teclado y la legibilidad.
2. Publicar `dist/` con el dominio confirmado, HTTPS y redirección consistente del dominio sin `www` hacia `www`. Revisar las redirecciones de las antiguas rutas `.html`, evitar copias indexables y confirmar que una URL inexistente devuelve estado HTTP 404.
3. Verificar en el sitio servido las canonical, el sitemap, robots, las imágenes y los enlaces de contacto. Comprobar rendimiento y accesibilidad con Lighthouse o PageSpeed Insights; el resultado depende también del alojamiento y de la red.
4. Añadir la propiedad del dominio en Google Search Console, verificarla por DNS, enviar el sitemap e inspeccionar la portada y algunas fichas. Revisar indexación y problemas de datos estructurados sin asumir que el envío implica indexación inmediata.
5. Verificar el dominio en Bing Webmaster Tools e informar el sitemap. Revisar sus diagnósticos de rastreo y cobertura.
6. Si la institución decide medir, configurar GA4 y la política de privacidad/consentimiento aplicable; validar en depuración que `lead_intent` se dispara una sola vez por clic y que no envía datos personales. Documentar esa conversión como intención de contacto.
7. Preparar campañas SEM con destinos relevantes, contenido confirmado y parámetros UTM. Definir presupuesto, segmentación y medición antes de activar anuncios; distinguir intención de contacto de inscripciones confirmadas al evaluar resultados.

Estas verificaciones de build cubren la implementación local. La publicación efectiva, el estado de DNS, las cuentas de medición y la indexación deben comprobarse sobre los servicios reales.

## Resultado de la revisión local — 4 de octubre de 2026

- Astro check: sin errores ni advertencias.
- Build estático: 28 páginas indexables (incluyendo 20 fichas), una página 404 y siete rutas antiguas con respaldo de redirección HTML. Los 301 se aplican mediante la configuración del hosting.
- Cinco pruebas de contenido, enlaces y SEO aprobadas.
- 29 pruebas de navegador aprobadas: filtros, guardados, migración del carrito anterior, borradores de formularios, móvil/tablet, teclado, galería y auditorías automáticas de accesibilidad en nueve páginas.
- Lighthouse móvil, sobre el build servido en localhost: rendimiento **99**, accesibilidad **100**, buenas prácticas **100**, SEO **100**. Son métricas de laboratorio, no datos de uso en producción ni una certificación integral de accesibilidad.
- Informes y capturas en `artifacts/` (generados localmente, excluidos de Git). No se publicaron cambios ni se activaron anuncios.

## Actualización SEO y lanzamiento (9 de octubre de 2026)

Se tomó como referencia la estructura pública de https://institutonoa.com.ar/: intención de búsqueda de formación profesional, catálogo y páginas por áreas. Los textos, cursos, ubicación y datos estructurados publicados corresponden exclusivamente a Tu Capacitación. No se trasladaron años de trayectoria, sedes, avales ni afirmaciones comerciales de otra institución.

Se añadieron cinco páginas indexables en `/areas/`, enlazadas desde el inicio y las fichas, con contenido descriptivo, listado de cursos, breadcrumbs, CollectionPage e ItemList. El sitemap contiene 33 URLs canónicas (20 cursos, cinco áreas y ocho páginas principales). Cada curso conserva su página, título local y marcado Course. El acceso al campus usa https://campus.tucapacitacion.com/portal.

Search Console debe verificarse con la cuenta propietaria; publicar el sitemap no equivale a enviarlo desde esa cuenta ni garantiza posiciones. No se han copiado identificadores de Analytics, anuncios ni verificaciones de terceros.
