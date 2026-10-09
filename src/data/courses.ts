export interface Course {
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
}

// Contenidos de la oferta original. Fechas, aranceles y modalidades se consultan
// con la institución: el sitio anterior no los vinculaba de forma verificable.
export const courses: Course[] = [
  {
    slug: 'secretario-administrativo',
    name: 'Secretario Administrativo',
    category: 'Administrativa',
    description:
      'Gestión de archivos, facturación, atención al cliente y herramientas administrativas esenciales para oficinas y empresas.',
    image: 'secretariado.png',
  },
  {
    slug: 'cajero-comercial',
    name: 'Cajero Comercial',
    category: 'Administrativa',
    description:
      'Técnicas de facturación, medios de pago, arqueo de caja, atención al público y control de stock.',
    image: 'cajero.png',
  },
  {
    slug: 'reparacion-de-celulares',
    name: 'Reparación de Celulares',
    category: 'Técnica',
    description:
      'Diagnóstico y reparación física y de software en dispositivos móviles. Soldadura, cambio de pantallas y fallas comunes.',
    image: 'rep_celulares.png',
  },
  {
    slug: 'tecnico-en-refrigeracion',
    name: 'Técnico en Refrigeración',
    category: 'Técnica',
    description:
      'Instalación, mantenimiento preventivo y reparación de equipos de refrigeración y aire acondicionado familiares y comerciales.',
    image: 'refrigeracion.png',
  },
  {
    slug: 'electricidad',
    name: 'Electricidad',
    category: 'Técnica',
    description:
      'Instalaciones eléctricas residenciales y comerciales, normativas de seguridad, tableros y mantenimiento de redes eléctricas.',
    image: 'electricidad.png',
  },
  {
    slug: 'operador-de-pc',
    name: 'Operador de PC',
    category: 'Informática',
    description:
      'Manejo completo de Windows, Microsoft Office (Word, Excel, PowerPoint), correo electrónico e internet para desempeño laboral rápido.',
    image: 'operador_pc.png',
  },
  {
    slug: 'diseno-grafico',
    name: 'Diseño Gráfico',
    category: 'Informática',
    description:
      'Creación de piezas visuales y contenido publicitario profesional con Photoshop e Illustrator.',
    image: 'diseno_grafico.png',
  },
  {
    slug: 'programacion',
    name: 'Programación',
    category: 'Informática',
    description:
      'Introducción al desarrollo de software y lenguajes de código modernos para inserción en la industria IT.',
    image: 'programacion.png',
  },
  {
    slug: 'marketing-digital',
    name: 'Marketing Digital',
    category: 'Informática',
    description:
      'Estrategias de publicidad en redes sociales, posicionamiento SEO/SEM y administración de contenidos digitales.',
    image: 'marketing.png',
  },
  {
    slug: 'estetica-integral',
    name: 'Estética Integral',
    category: 'Belleza',
    description:
      'Tratamientos estéticos faciales y corporales, cuidados de la piel, cosmetología básica y bienestar integral de los clientes.',
    image: 'estetica_integral.png',
  },
  {
    slug: 'peluqueria-profesional',
    name: 'Peluquería Profesional',
    category: 'Belleza',
    description:
      'Técnicas modernas de corte, colorimetría, peinado, peinados artísticos y tratamientos capilares completos.',
    image: 'peluqueria.png',
  },
  {
    slug: 'barberia-y-peluqueria-masculina',
    name: 'Barbería y Peluquería Masculina',
    category: 'Belleza',
    description:
      'Cortes de cabello para hombres, técnicas de afeitado tradicional, perfilado de barba y diseños de tendencia.',
    image: 'barberia.png',
  },
  {
    slug: 'acompanante-terapeutico',
    name: 'Acompañante Terapéutico',
    category: 'Salud',
    description:
      'Rol fundamental en el cuidado de la salud mental, contención y acompañamiento personalizado a pacientes en tratamiento.',
    image: 'acomp_terapeutico.png',
  },
  {
    slug: 'masajista-profesional',
    name: 'Masajista Profesional',
    category: 'Salud',
    description:
      'Práctica de masajes corporales relajantes, descontracturantes, deportivos y técnicas de bienestar físico.',
    image: 'masajista_profesional.png',
  },
  {
    slug: 'lengua-de-senas',
    name: 'Lengua de Señas',
    category: 'Salud',
    description:
      'Aprendizaje del alfabeto dactilológico y la estructura gramatical de la Lengua de Señas para una comunicación inclusiva y accesible.',
    image: 'lengua_senas.png',
  },
  {
    slug: 'auxiliar-en-veterinaria',
    name: 'Auxiliar en Veterinaria',
    category: 'Salud',
    description:
      'Asistencia al médico veterinario en clínicas. Cuidado de mascotas, instrumental, curaciones y atención pre y post operatoria.',
    image: 'aux_veterinaria.png',
  },
  {
    slug: 'asistente-paramedico',
    name: 'Asistente Paramédico',
    category: 'Salud',
    description:
      'Primeros auxilios avanzados, atención prehospitalaria en situaciones de emergencia y soporte vital básico.',
    image: 'asist_paramedico.png',
  },
  {
    slug: 'auxiliar-en-farmacia',
    name: 'Auxiliar en Farmacia',
    category: 'Salud',
    description:
      'Atención al público en farmacias, control de stock, recetas de obras sociales, medicamentos y dispensación segura.',
    image: 'aux_farmacia.png',
  },
  {
    slug: 'agente-sanitario',
    name: 'Agente Sanitario',
    category: 'Salud',
    description:
      'Promoción de la salud comunitaria, campañas preventivas, visitas sanitarias y nexo de salud con las familias.',
    image: 'agente_sanitario.png',
  },
  {
    slug: 'cosmetologia',
    name: 'Cosmetología',
    category: 'Salud',
    description:
      'Cuidado de la piel sana, higiene profunda, tratamientos dermoestéticos faciales, masajes de rostro y uso de principios activos.',
    image: 'cosmetologia.png',
  },
];

export const categories: string[] = [...new Set(courses.map((course) => course.category))];

const featuredSlugs = [
  'programacion',
  'auxiliar-en-farmacia',
  'reparacion-de-celulares',
  'peluqueria-profesional',
];

export const featuredCourses: Course[] = featuredSlugs.flatMap((slug) =>
  courses.filter((course) => course.slug === slug),
);
