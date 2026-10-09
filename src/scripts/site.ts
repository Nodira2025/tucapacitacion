export {};
type SavedCourse = { slug: string; name: string };
type AnalyticsWindow = Window & { dataLayer?: Record<string, unknown>[] };
const courseIndex: SavedCourse[] = JSON.parse(
  document.getElementById('course-index')?.textContent || '[]',
);
const bySlug = new Map(courseIndex.map((course) => [course.slug, course]));
const key = 'tuCapacitacionCart';
let saved = new Set<string>();
let storageAvailable = true;
try {
  const stored = localStorage.getItem(key) || '[]';
  let raw: unknown = [];
  try {
    raw = JSON.parse(stored);
  } catch {
    /* Ignore corrupt legacy data. */
  }
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (!entry || typeof entry !== 'object') continue;
      const course = courseIndex.find(
        (course) => course.slug === entry.slug || course.name === entry.name,
      );
      if (course) saved.add(course.slug);
    }
  }
} catch {
  storageAvailable = false;
}

const dialog = document.querySelector<HTMLDialogElement>('#saved-dialog');
const liveStatus = document.getElementById('site-status');
let previousFocus: HTMLElement | null = null;
function renderSaved() {
  document
    .querySelectorAll<HTMLElement>('[data-saved-count]')
    .forEach((el) => (el.textContent = String(saved.size)));
  document
    .querySelectorAll<HTMLButtonElement>('[data-open-saved]')
    .forEach((button) =>
      button.setAttribute('aria-label', `Ver mis cursos guardados: ${saved.size}`),
    );
  document.querySelectorAll<HTMLButtonElement>('[data-save-course]').forEach((button) => {
    const slug = button.dataset.saveCourse || '';
    const active = saved.has(slug);
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute(
      'aria-label',
      `${active ? 'Quitar' : 'Guardar'} ${bySlug.get(slug)?.name || 'curso'}`,
    );
    const visibleLabel = button.querySelector<HTMLElement>('[data-save-label]');
    if (visibleLabel) {
      visibleLabel.textContent = active ? 'Quitar de mis guardados' : 'Guardar este curso';
      button.setAttribute(
        'aria-label',
        `${visibleLabel.textContent}: ${bySlug.get(slug)?.name || 'curso'}`,
      );
    }
  });
  const list = document.getElementById('saved-list');
  if (list) {
    list.replaceChildren();
    for (const slug of saved) {
      const course = bySlug.get(slug);
      if (!course) continue;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `/cursos/${slug}/`;
      link.textContent = course.name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Quitar';
      remove.setAttribute('aria-label', `Quitar ${course.name}`);
      remove.addEventListener('click', () => {
        saved.delete(slug);
        persist();
        announce(`${course.name} quitado de tus cursos guardados.`);
        (
          list.querySelector('button') ||
          document.querySelector<HTMLButtonElement>('[data-close-saved]')
        )?.focus();
      });
      item.append(link, remove);
      list.append(item);
    }
  }
  const empty = document.getElementById('saved-empty');
  const inquiry = document.querySelector<HTMLAnchorElement>('#saved-inquiry');
  if (empty) empty.hidden = saved.size > 0;
  if (inquiry) {
    inquiry.hidden = saved.size === 0;
    const names = [...saved]
      .map((slug) => bySlug.get(slug)?.name)
      .filter(Boolean)
      .join(', ');
    inquiry.href = `https://wa.me/5493855140883?text=${encodeURIComponent(`Hola, me interesan estos cursos: ${names}. ¿Me comparten programas, horarios y aranceles vigentes?`)}`;
  }
  const notice = document.getElementById('storage-notice');
  if (notice) notice.hidden = storageAvailable;
}
function announce(message: string) {
  if (liveStatus) liveStatus.textContent = message;
}
function persist() {
  try {
    localStorage.setItem(key, JSON.stringify([...saved].map((slug) => bySlug.get(slug))));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  renderSaved();
}
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const save = event.target.closest<HTMLButtonElement>('[data-save-course]');
  if (save) {
    const slug = save.dataset.saveCourse || '';
    const course = bySlug.get(slug);
    if (!course) return;
    if (saved.has(slug)) saved.delete(slug);
    else saved.add(slug);
    persist();
    announce(
      `${course.name} ${saved.has(slug) ? 'agregado a' : 'quitado de'} tus cursos guardados.`,
    );
  }
  if (event.target.closest('[data-open-saved]')) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
  }
  if (event.target.closest('[data-close-saved]')) dialog?.close();
});
dialog?.addEventListener('close', () => previousFocus?.focus());
dialog?.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  )
    dialog.close();
});
const mobileMenu = document.querySelector<HTMLDetailsElement>('.mobile-menu');
mobileMenu
  ?.querySelectorAll('a')
  .forEach((link) => link.addEventListener('click', () => (mobileMenu.open = false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu?.open) {
    mobileMenu.open = false;
    mobileMenu.querySelector('summary')?.focus();
  }
});
document.addEventListener('click', (event) => {
  if (mobileMenu?.open && event.target instanceof Node && !mobileMenu.contains(event.target))
    mobileMenu.open = false;
});

// Campaign attribution is session-scoped and excludes form data and search queries.
const campaign: Record<string, string> = {};
try {
  const params = new URLSearchParams(location.search);
  const fields = ['utm_source', 'utm_medium', 'utm_campaign'];
  const incoming = fields.some((field) => params.has(field));
  const previous = incoming ? {} : JSON.parse(sessionStorage.getItem('tc-campaign') || '{}');
  for (const field of fields) {
    const value = incoming ? params.get(field) : previous?.[field];
    if (typeof value === 'string' && /^[a-zA-Z0-9 _.-]{1,80}$/.test(value)) campaign[field] = value;
  }
  sessionStorage.setItem('tc-campaign', JSON.stringify(campaign));
} catch {
  /* Navigation and contact remain available without browser storage. */
}
function trackIntent(source: string, course?: string) {
  const target = window as AnalyticsWindow;
  target.dataLayer = target.dataLayer || [];
  target.dataLayer.push({
    event: 'lead_intent',
    contact_method: 'whatsapp',
    source,
    ...(course && bySlug.has(course) ? { course_slug: course } : {}),
    ...campaign,
  });
}
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[href^="https://wa.me/"]');
  if (link) trackIntent(link.dataset.lead || 'contact_link', link.dataset.course);
});
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (
    !(form instanceof HTMLFormElement) ||
    !['contactForm', 'jobForm'].includes(form.id) ||
    !form.checkValidity()
  )
    return;
  const valid = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[required], textarea[required]',
    ),
  ).every((field) => field.value.trim());
  if (valid) trackIntent(form.id === 'contactForm' ? 'contact_form' : 'job_form');
});
renderSaved();
document.documentElement.dataset.enhanced = 'true';
