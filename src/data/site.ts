export const site = {
  name: 'Tu Capacitación',
  url: 'https://www.tucapacitacion.com',
  phone: '5493855140883',
  phoneDisplay: '+54 9 385 514-0883',
  email: 'info@tucapacitacion.com.ar',
  address: '25 de Mayo 54',
  city: 'Santiago del Estero',
  instagram: 'https://www.instagram.com/tucapacitacionoficial',
  facebook: 'https://www.facebook.com/Tucapacitacionoficial',
  tiktok: 'https://www.tiktok.com/@tucapacitacion',
  youtube: 'https://www.youtube.com/@tucapacitacion',
  // Set the confirmed student campus URL independently of the employee portal.
  studentCampus: 'https://campus.tucapacitacion.com/portal',
  employeePortal: 'http://200.58.126.154:3001/',
};

export function whatsapp(message: string): string {
  return `https://wa.me/${site.phone}?text=${encodeURIComponent(message)}`;
}
