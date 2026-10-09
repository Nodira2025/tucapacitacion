export const areas = [
  {
    slug: 'administracion',
    category: 'Administrativa',
    name: 'Administración',
    description:
      'Cursos de administración y cajero comercial en Santiago del Estero. Conocé los contenidos y consultá horarios, modalidades y aranceles en Tu Capacitación.',
    intro:
      'Aprendé herramientas para la organización de oficinas, la atención al público y la gestión comercial. Compará las propuestas de secretariado administrativo y caja comercial para elegir según tus intereses.',
    skills:
      'Archivo y documentación, facturación, atención al cliente, medios de pago y control de caja, según el curso elegido.',
  },
  {
    slug: 'oficios-tecnicos',
    category: 'Técnica',
    name: 'Oficios técnicos',
    description:
      'Cursos de electricidad, refrigeración y reparación de celulares en Santiago del Estero. Explorá la formación técnica de Tu Capacitación y consultá cómo empezar.',
    intro:
      'Explorá la formación en instalación, mantenimiento y reparación. Cada curso aborda herramientas y procedimientos de un oficio específico: electricidad, refrigeración o reparación de dispositivos móviles.',
    skills:
      'Diagnóstico de fallas, uso de herramientas y procedimientos de instalación o reparación vinculados con cada especialidad.',
  },
  {
    slug: 'informatica',
    category: 'Informática',
    name: 'Informática y tecnología',
    description:
      'Cursos de programación, diseño gráfico, marketing digital y operador de PC en Santiago del Estero. Encontrá tu formación en tecnología en Tu Capacitación.',
    intro:
      'Descubrí opciones para empezar a usar herramientas digitales o explorar una especialidad. El área reúne formación en operación de computadoras, desarrollo de software, comunicación visual y marketing digital.',
    skills:
      'Uso de computadoras, lenguajes de programación, herramientas de diseño y comunicación digital, según el programa de cada curso.',
  },
  {
    slug: 'belleza',
    category: 'Belleza',
    name: 'Belleza',
    description:
      'Cursos de peluquería, barbería y estética integral en Santiago del Estero. Conocé las propuestas de Tu Capacitación y consultá modalidades y requisitos.',
    intro:
      'Conocé las propuestas de formación en cuidado personal, peluquería y barbería. Elegí el curso según las técnicas que te interesan y consultá con el equipo sus contenidos, materiales y requisitos.',
    skills:
      'Técnicas de corte, peinado, colorimetría y cuidado estético, de acuerdo con la especialidad y los contenidos de cada propuesta.',
  },
  {
    slug: 'salud',
    category: 'Salud',
    name: 'Salud y cuidado',
    description:
      'Cursos de auxiliar en farmacia, acompañamiento terapéutico y más en Santiago del Estero. Conocé el área de salud de Tu Capacitación y sus requisitos.',
    intro:
      'Explorá cursos vinculados con la atención, el acompañamiento y el cuidado de personas y animales. Revisá la ficha de cada propuesta y consultá su alcance, los requisitos y la certificación correspondiente.',
    skills:
      'Contenidos de atención en farmacia, acompañamiento, cuidado animal, masajes y otras especialidades. El alcance profesional y la certificación deben consultarse para cada curso.',
  },
];
export const areaForCategory = (category: string) =>
  areas.find((area) => area.category === category)!;
export const areaUrl = (category: string) => `/areas/${areaForCategory(category).slug}/`;
