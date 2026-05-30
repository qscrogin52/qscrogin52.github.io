(function () {
  const root = window.location.pathname.includes('/building-blocks-baseball/') ? '/building-blocks-baseball/' : '/';

  const links = [
    { label: 'Home', href: root },
    { label: 'Our Program', href: root + 'our-program/' },
    { label: 'Schools', href: root + 'schools/' },
    { label: 'Parent FAQ', href: root + 'parent-faq/' },
    { label: 'Contact', href: root + 'contact/' }
  ];

  function isActive(href) {
    const path = window.location.pathname.replace(/index\.html$/, '');
    const url = new URL(href, window.location.origin).pathname.replace(/index\.html$/, '');
    if (url === root) return path === root || path.endsWith('/building-blocks-baseball/');
    return path.startsWith(url);
  }

  function renderHeader() {
    const header = document.querySelector('[data-site-header]');
    if (!header) return;

    header.innerHTML = `
      <div class="top-strip">Putting the fun in fundamentals for preschool and early elementary players.</div>
      <header class="site-header">
        <a class="brand" href="${root}" aria-label="Building Blocks Baseball home">
          <img src="${root}assets/images/logo.svg" alt="Building Blocks Baseball" />
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav id="site-nav" class="site-nav" aria-label="Main navigation">
          ${links.map(link => `<a class="${isActive(link.href) ? 'active' : ''}" href="${link.href}">${link.label}</a>`).join('')}
        </nav>
      </header>
    `;

    const toggle = header.querySelector('.nav-toggle');
    const nav = header.querySelector('.site-nav');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
  }

  function renderFooter() {
    const footer = document.querySelector('[data-site-footer]');
    if (!footer) return;

    footer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-grid">
          <div>
            <img class="footer-logo" src="${root}assets/images/logo.svg" alt="Building Blocks Baseball" />
            <p>Baseball fundamentals, teamwork, and confidence-building practices for young players across the St. Louis area.</p>
          </div>
          <div>
            <h2>Pages</h2>
            <a href="${root}">Home</a>
            <a href="${root}our-program/">Our Program</a>
            <a href="${root}schools/">Schools</a>
            <a href="${root}parent-faq/">Parent FAQ</a>
            <a href="${root}privacy-policy/">Privacy Policy</a>
          </div>
          <div>
            <h2>Connect</h2>
            <a href="https://www.instagram.com/buildingblocksbaseball/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.facebook.com/BuildingBlocksBaseball/" target="_blank" rel="noopener">Facebook</a>
            <a href="${root}contact/">Contact Us</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Building Blocks Baseball. All rights reserved.</span>
          <span>St. Louis, Missouri</span>
        </div>
      </footer>
    `;
  }

  function setYear() {
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    setYear();
  });
})();
