import sharp from 'sharp';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
await mkdir(new URL('../public/', import.meta.url), { recursive: true });
const logo = await readFile(new URL('../src/assets/img/logo.png', import.meta.url));
await writeFile(new URL('../public/logo.png', import.meta.url), logo);
await sharp(logo)
  .resize(192, 64, { fit: 'inside' })
  .png()
  .toFile(fileURLToPath(new URL('../public/favicon.png', import.meta.url)));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#ffffff"/><rect width="1200" height="14" fill="#002898"/><text x="72" y="205" font-family="Arial" font-size="17" font-weight="bold" fill="#cf1726" letter-spacing="3">FORMACIÓN PROFESIONAL</text><text x="68" y="306" font-family="Arial" font-size="73" font-weight="bold" fill="#002898" letter-spacing="-3">Aprendé un oficio.</text><text x="68" y="398" font-family="Arial" font-size="74" fill="#cf1726" letter-spacing="-3">Abrí nuevas posibilidades.</text><path d="M1030 65h88v88M1118 65l-90 90" fill="none" stroke="#002898" stroke-width="14"/><line x1="72" y1="463" x2="1128" y2="463" stroke="#dce2df"/><text x="72" y="541" font-family="Arial" font-size="21" fill="#002898">Cursos y formación en Santiago del Estero</text><text x="1128" y="591" text-anchor="end" font-family="Arial" font-size="16" fill="#5e6d74">www.tucapacitacion.com</text></svg>`;
const mark = await sharp(logo).resize(290).toBuffer();
await sharp(Buffer.from(svg))
  .composite([{ input: mark, top: 45, left: 70 }])
  .png()
  .toFile(fileURLToPath(new URL('../public/social-card.png', import.meta.url)));
