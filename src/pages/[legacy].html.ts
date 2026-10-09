import type { APIRoute } from 'astro';
export function getStaticPaths() {
  return [
    'cursos',
    'instituto',
    'sedes',
    'contacto',
    'galeria',
    'trabaja-con-nosotros',
    'terminos-y-condiciones',
  ].map((legacy) => ({ params: { legacy }, props: { destination: `/${legacy}/` } }));
}
export const GET: APIRoute = ({ props, site }) => {
  const destination = props.destination as string;
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tu Capacitación — página actualizada</title><meta name="robots" content="noindex, follow"><meta http-equiv="refresh" content="0;url=${destination}"><link rel="canonical" href="${new URL(destination, site).href}"></head><body><h1>Esta página tiene una nueva dirección.</h1><p><a href="${destination}">Continuar a Tu Capacitación</a></p></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
};
