(function() {
  let tabs = [];
  let activeTabId = null;

  const tabStrip = document.getElementById('tab-strip');
  const newTabBtn = document.getElementById('new-tab-btn');
  const addressInput = document.getElementById('address-input');
  const viewportContainer = document.getElementById('viewport-container');
  const btnBack = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');
  const btnReload = document.getElementById('btn-reload');
  const btnHome = document.getElementById('btn-home');

  const cloaks = {
    drive: { title: 'Google Drive', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    classroom: { title: 'Google Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png' },
    canvas: { title: 'Dashboard', icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico' },
    reset: { title: 'Static', icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>" }
  };

  function applyCloak(title, iconUrl) {
    document.title = title;
    let favicon = document.getElementById('favicon');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.id = 'favicon';
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = iconUrl;
    localStorage.setItem('static_cloak_title', title);
    localStorage.setItem('static_cloak_icon', iconUrl);
  }

  function restoreCloak() {
    const savedTitle = localStorage.getItem('static_cloak_title');
    const savedIcon = localStorage.getItem('static_cloak_icon');
    if (savedTitle && savedIcon) {
      applyCloak(savedTitle, savedIcon);
    }
  }

  function openAboutBlank() {
    const win = window.open('about:blank', '_blank');
    if (!win) return alert('Popup blocked! Please allow popups.');
    const doc = win.document;
    doc.open();
    doc.write(document.documentElement.outerHTML);
    doc.close();
    window.location.replace('https://google.com');
  }

  function createTab(url = 'newtab.html', title = 'New Tab') {
    const id = 'tab-' + Math.random().toString(36).substring(2, 9);
    const iframe = document.createElement('iframe');
    iframe.id = 'iframe-' + id;
    iframe.src = url;
    iframe.style.display = 'none';
    viewportContainer.appendChild(iframe);

    const tabObj = {
      id: id,
      url: url,
      title: title,
      iframe: iframe
    };

    tabs.push(tabObj);
    renderTabElement(tabObj);
    switchTab(id);
  }

  function renderTabElement(tab) {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.id = 'tab-element-' + tab.id;
    
    tabEl.innerHTML = `
      <span class="tab-favicon"><i data-lucide="zap"></i></span>
      <span class="tab-title">${tab.title}</span>
      <span class="tab-close"><i data-lucide="x"></i></span>
    `;

    tabEl.addEventListener('click', (e) => {
      if (!e.target.closest('.tab-close')) {
        switchTab(tab.id);
      }
    });

    tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    tabStrip.insertBefore(tabEl, newTabBtn);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function switchTab(id) {
    tabs.forEach(t => {
      const tabEl = document.getElementById('tab-element-' + t.id);
      if (t.id === id) {
        activeTabId = id;
        t.iframe.style.display = 'block';
        if (tabEl) tabEl.classList.add('active');
        updateAddressBar(t.url);
      } else {
        t.iframe.style.display = 'none';
        if (tabEl) tabEl.classList.remove('active');
      }
    });
  }

  function closeTab(id) {
    const index = tabs.findIndex(t => t.id === id);
    if (index === -1) return;

    const tabToClose = tabs[index];
    if (tabToClose.iframe && tabToClose.iframe.parentNode) {
      tabToClose.iframe.parentNode.removeChild(tabToClose.iframe);
    }

    const tabEl = document.getElementById('tab-element-' + id);
    if (tabEl && tabEl.parentNode) {
      tabEl.parentNode.removeChild(tabEl);
    }

    tabs.splice(index, 1);

    if (activeTabId === id) {
      if (tabs.length > 0) {
        const newActiveIndex = Math.max(0, index - 1);
        switchTab(tabs[newActiveIndex].id);
      } else {
        createTab();
      }
    }
  }

  function updateAddressBar(url) {
    if (url === 'newtab.html') {
      addressInput.value = '';
    } else {
      addressInput.value = url;
    }
  }

  function navigateCurrentTab(input) {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;

    let targetUrl = input;
    if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith('home/') && targetUrl !== 'newtab.html') {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(targetUrl);
      }
    }

    tab.url = targetUrl;
    tab.iframe.src = targetUrl;
    updateAddressBar(targetUrl);

    const tabEl = document.getElementById('tab-element-' + tab.id);
    if (tabEl) {
      const titleEl = tabEl.querySelector('.tab-title');
      if (titleEl) {
        titleEl.textContent = targetUrl.replace(/^https?:\/\//, '').split('/')[0] || targetUrl;
      }
    }
  }

  newTabBtn.addEventListener('click', () => createTab('newtab.html', 'New Tab'));

  addressInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = addressInput.value.trim();
      if (val) {
        navigateCurrentTab(val);
      }
    }
  });

  btnBack.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.iframe.contentWindow) {
      try {
        tab.iframe.contentWindow.history.back();
      } catch (err) {}
    }
  });

  btnForward.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.iframe.contentWindow) {
      try {
        tab.iframe.contentWindow.history.forward();
      } catch (err) {}
    }
  });

  btnReload.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) {
      tab.iframe.src = tab.url;
    }
  });

  btnHome.addEventListener('click', () => {
    navigateCurrentTab('home/index.html');
  });

  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'NAVIGATE') {
      navigateCurrentTab(event.data.url);
    } else if (event.data.type === 'OPEN_ABOUT_BLANK') {
      openAboutBlank();
    } else if (event.data.type === 'SET_CLOAK') {
      const p = cloaks[event.data.preset];
      if (p) applyCloak(p.title, p.icon);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === 'Escape') {
      window.location.href = 'https://classroom.google.com';
    }
  });

  restoreCloak();
  createTab('newtab.html', 'New Tab');
})();
