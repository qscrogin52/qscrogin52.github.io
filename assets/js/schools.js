const BBB_SCHOOLS_CONFIG = {
  // Replace this with your published Google Sheets CSV URL when ready.
  csvUrl: '',
  registrationFallback: 'https://www.buildingblocksbaseballstl.com/schools'
};

const SAMPLE_SCHOOLS = [
  {
    name: 'A to Z Kids Childcare',
    slug: 'a-to-z-kids-childcare',
    city: 'O\'Fallon',
    season: 'Spring 2026',
    status: 'Open',
    ages: 'Ages 3–5',
    day: 'Tuesday',
    time: '10:00 AM',
    location: 'School gym / activity room',
    address: 'O\'Fallon, MO',
    registrationUrl: '',
    notes: 'Equipment is provided for practices. Players should wear comfortable clothes and tennis shoes.',
    schedule: '2026-04-07|Week 1;2026-04-14|Week 2;2026-04-21|Week 3;2026-04-28|Week 4;2026-05-05|Week 5;2026-05-12|Week 6'
  },
  {
    name: 'Great Beginnings Daycare and Preschool – Cottleville',
    slug: 'great-beginnings-cottleville',
    city: 'Cottleville',
    season: 'Spring 2026',
    status: 'Closed',
    ages: 'Ages 3–5',
    day: 'Thursday',
    time: '9:30 AM',
    location: 'Outdoor play area',
    address: 'Cottleville, MO',
    registrationUrl: '',
    notes: 'Registration is closed for this session.',
    schedule: '2026-04-09|Week 1;2026-04-16|Week 2;2026-04-23|Week 3;2026-04-30|Week 4;2026-05-07|Week 5;2026-05-14|Week 6'
  },
  {
    name: 'Little Learners Academy',
    slug: 'little-learners-academy',
    city: 'St. Charles',
    season: 'Summer 2026',
    status: 'Coming Soon',
    ages: 'Ages 3–6',
    day: 'Monday',
    time: '10:30 AM',
    location: 'TBD',
    address: 'St. Charles, MO',
    registrationUrl: '',
    notes: 'Summer registration details will be posted soon.',
    schedule: ''
  }
];

function normalizeKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase());
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (field || row.length) {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      }
      if (char === '\r' && next === '\n') i++;
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map(normalizeKey);
  return rows.slice(1).filter(r => r.some(cell => String(cell).trim())).map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (r[i] || '').trim(); });
    obj.name = obj.name || obj.school || obj.schoolName || obj.site || '';
    obj.slug = obj.slug || slugify(obj.name);
    obj.city = obj.city || '';
    obj.status = obj.status || obj.registrationStatus || 'Open';
    obj.registrationUrl = obj.registrationUrl || obj.registrationLink || obj.register || '';
    obj.schedule = obj.schedule || obj.dates || '';
    return obj;
  }).filter(s => s.name);
}

async function loadSchools() {
  if (!BBB_SCHOOLS_CONFIG.csvUrl) return SAMPLE_SCHOOLS;
  try {
    const response = await fetch(BBB_SCHOOLS_CONFIG.csvUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('CSV request failed');
    const schools = parseCSV(await response.text());
    return schools.length ? schools : SAMPLE_SCHOOLS;
  } catch (error) {
    console.warn('Using sample school data because CSV failed:', error);
    return SAMPLE_SCHOOLS;
  }
}

function statusClass(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('closed')) return 'closed';
  if (value.includes('soon')) return 'closed';
  return 'open';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value + 'T12:00:00');
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseSchedule(scheduleText) {
  if (!scheduleText) return [];
  return String(scheduleText).split(';').map(item => {
    const parts = item.split('|').map(p => p.trim());
    return {
      date: parts[0] || '',
      title: parts[1] || 'Practice',
      note: parts[2] || '',
      cancelled: /cancel|closed|skip/i.test(parts.join(' '))
    };
  }).filter(item => item.date || item.title);
}

function renderDirectory(schools) {
  const grid = document.querySelector('[data-school-grid]');
  const search = document.querySelector('[data-school-search]');
  const cityWrap = document.querySelector('[data-city-pills]');
  const count = document.querySelector('[data-school-count]');
  if (!grid) return;

  let activeCity = 'All';
  const cities = ['All', ...Array.from(new Set(schools.map(s => s.city).filter(Boolean))).sort()];

  function renderPills() {
    cityWrap.innerHTML = cities.map(city => `<button class="pill ${city === activeCity ? 'active' : ''}" type="button" data-city="${city}">${city}</button>`).join('');
    cityWrap.querySelectorAll('[data-city]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCity = btn.dataset.city;
        render();
        renderPills();
      });
    });
  }

  function render() {
    const query = (search?.value || '').toLowerCase().trim();
    const filtered = schools.filter(s => {
      const haystack = `${s.name} ${s.city} ${s.season} ${s.day}`.toLowerCase();
      const cityOk = activeCity === 'All' || s.city === activeCity;
      const searchOk = !query || haystack.includes(query);
      return cityOk && searchOk;
    });

    count.textContent = `${filtered.length} school${filtered.length === 1 ? '' : 's'}`;
    if (!filtered.length) {
      grid.innerHTML = '<div class="empty">No schools match your search.</div>';
      return;
    }

    grid.innerHTML = filtered.map(s => {
      const registrationOpen = statusClass(s.status) === 'open';
      const detailUrl = `school.html?school=${encodeURIComponent(s.slug || slugify(s.name))}`;
      const regUrl = s.registrationUrl || BBB_SCHOOLS_CONFIG.registrationFallback;
      return `
        <article class="card school-card">
          <div class="badge-row">
            <span class="badge ${statusClass(s.status)}">${registrationOpen ? 'Registration Open' : 'Registration Closed'}</span>
            ${s.season ? `<span class="badge">${s.season}</span>` : ''}
          </div>
          <h3>${s.name}</h3>
          <div class="meta">
            ${s.city ? `<span><strong>City:</strong> ${s.city}</span>` : ''}
            ${s.day || s.time ? `<span><strong>Practice:</strong> ${[s.day, s.time].filter(Boolean).join(' · ')}</span>` : ''}
            ${s.ages ? `<span><strong>Ages:</strong> ${s.ages}</span>` : ''}
          </div>
          <div class="school-actions">
            <a class="btn btn-secondary" href="${detailUrl}">View Details</a>
            ${registrationOpen ? `<a class="btn btn-primary" href="${regUrl}" target="_blank" rel="noopener">Register</a>` : `<span class="btn btn-disabled">Registration Closed</span>`}
          </div>
        </article>`;
    }).join('');
  }

  search?.addEventListener('input', render);
  renderPills();
  render();
}

function renderSchoolDetail(schools) {
  const page = document.querySelector('[data-school-detail]');
  if (!page) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('school');
  const school = schools.find(s => (s.slug || slugify(s.name)) === slug) || schools[0];
  if (!school) {
    page.innerHTML = '<div class="empty">School not found.</div>';
    return;
  }
  document.title = `${school.name} | Building Blocks Baseball`;
  const registrationOpen = statusClass(school.status) === 'open';
  const regUrl = school.registrationUrl || BBB_SCHOOLS_CONFIG.registrationFallback;
  const schedule = parseSchedule(school.schedule);

  page.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <p class="kicker">School Details</p>
        <h1>${school.name}</h1>
        <p class="lead">${[school.city, school.season, school.ages].filter(Boolean).join(' · ')}</p>
        <div class="button-row">
          ${registrationOpen ? `<a class="btn btn-primary" href="${regUrl}" target="_blank" rel="noopener">Register</a>` : `<span class="btn btn-disabled">Registration Closed</span>`}
          <a class="btn btn-secondary" href="./">Back to Schools</a>
          <button class="btn btn-secondary" type="button" onclick="window.print()">Print Schedule</button>
        </div>
      </div>
    </section>
    <section class="section-sm">
      <div class="container detail-panel">
        <main>
          <div class="card">
            <h2>Schedule</h2>
            ${schedule.length ? `<div class="schedule-list">${schedule.map(item => `
              <div class="schedule-item ${item.cancelled ? 'cancelled' : ''}">
                <div class="schedule-date">${formatDate(item.date)}</div>
                <div>
                  <strong class="schedule-title">${item.title}</strong>
                  ${item.note ? `<p>${item.note}</p>` : ''}
                </div>
              </div>`).join('')}</div>` : '<p>Schedule details will be posted soon.</p>'}
          </div>
        </main>
        <aside class="card side-box">
          <h2>Practice Info</h2>
          <div class="meta">
            ${school.day || school.time ? `<span><strong>Day/Time:</strong> ${[school.day, school.time].filter(Boolean).join(' · ')}</span>` : ''}
            ${school.location ? `<span><strong>Location:</strong> ${school.location}</span>` : ''}
            ${school.address ? `<span><strong>Address:</strong> ${school.address}</span>` : ''}
            <span><strong>Status:</strong> ${registrationOpen ? 'Registration Open' : 'Registration Closed'}</span>
          </div>
          <hr style="border:0;border-top:1px solid var(--gray-200);margin:1rem 0;">
          <p>${school.notes || 'Equipment is provided for practices. Players should wear comfortable clothes and tennis shoes.'}</p>
        </aside>
      </div>
    </section>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const schools = await loadSchools();
  renderDirectory(schools);
  renderSchoolDetail(schools);
});
