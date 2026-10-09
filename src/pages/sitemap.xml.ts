import type { APIRoute } from 'astro';
import { areas } from '../data/areas';
import { courses } from '../data/courses';
export const GET: APIRoute = ({ site }) => {
  const routes = [
    '/',
    '/cursos/',
    '/instituto/',
    '/sedes/',
    '/contacto/',
    '/galeria/',
    '/trabaja-con-nosotros/',
    '/terminos-y-condiciones/',
    ...areas.map((area) => '/areas/' + area.slug + '/'),
    ...courses.map((course) => `/cursos/${course.slug}/`),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${new URL(route, site).href}</loc></url>`).join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
