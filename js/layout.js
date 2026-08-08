(function () {
  const page = (location.pathname.split('/').pop() || 'index.html');
  const filterPages = ['anime.html', 'movie.html', 'bookmark.html', 'history.html'];
  const isFilterPage = filterPages.indexOf(page) !== -1;
  const searchId = isFilterPage ? 'search' : 'globalSearch';

  const navItems = [
    ['index.html', 'Home'],
    ['anime.html', 'Anime'],
    ['movie.html', 'Movie'],
    ['bookmark.html', 'Bookmarks'],
    ['history.html', 'History']
  ];
  const nav = navItems.map(function ([href, label]) {
    return '<a' + (href === page ? ' class="active"' : '') + ' href="' + href + '">' + label + '</a>';
  }).join('');

  document.getElementById('site-header').innerHTML =
    '<header class="header">' +
      '<a class="logo" href="index.html"><img class="logo-img" src="/channels4_profile.jpg" alt="">Anicreator</a>' +
      '<nav>' + nav + '</nav>' +
      '<div class="search-box"><input id="' + searchId + '" class="search" placeholder="Search...">' +
      '<button id="searchBtn" class="search-btn" aria-label="Search">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>' +
      '</button></div>' +
    '</header>' +
    '<div class="search-popup" id="searchPopup">' +
      '<div class="search-popup-inner">' +
        '<input id="mobileSearch" class="search-popup-input" placeholder="Search..." autocomplete="off">' +
        '<button class="search-popup-go" id="mobileSearchBtn">Search</button>' +
        '<button class="search-popup-close" id="searchPopupClose" aria-label="Close">&times;</button>' +
      '</div>' +
    '</div>';

  document.getElementById('site-footer').innerHTML =
    '<footer>Anicreator does not store any files on our server, we only linked to the media which is hosted on 3rd party services. &copy; 2025 Anicreator.in. All rights reserved.</footer>';

  const mobileNav = document.createElement('nav');
  mobileNav.id = 'mobile-nav';
  mobileNav.innerHTML = nav;
  document.body.appendChild(mobileNav);

  const mobInput = document.getElementById('mobileSearch');

  function goSearch(value) {
    const v = String(value || '').trim();
    if (!v) return;
    if (isFilterPage) {
      const input = document.getElementById(searchId);
      input.value = v;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      location.href = 'anime.html?q=' + encodeURIComponent(v);
    }
  }

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }
  function openPopup() {
    const popup = document.getElementById('searchPopup');
    popup.classList.add('open');
    mobInput.value = '';
    setTimeout(function () { mobInput.focus(); }, 0);
  }
  function closePopup() {
    document.getElementById('searchPopup').classList.remove('open');
  }

  const inlineInput = document.getElementById(searchId);
  const searchBtn = document.getElementById('searchBtn');
  inlineInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') goSearch(inlineInput.value); });
  searchBtn.addEventListener('click', function () {
    if (isMobile()) openPopup(); else goSearch(inlineInput.value);
  });

  document.getElementById('mobileSearchBtn').addEventListener('click', function () {
    const v = mobInput.value.trim();
    mobInput.value = v;
    goSearch(mobInput.value);
    closePopup();
  });
  mobInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var v = mobInput.value.trim();
      mobInput.value = v;
      goSearch(v);
      closePopup();
    }
  });
  document.getElementById('searchPopupClose').addEventListener('click', closePopup);
  document.getElementById('searchPopup').addEventListener('click', function (e) {
    if (e.target === this) closePopup();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });
})();