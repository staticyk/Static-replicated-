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

  function createTab(url = 'newtab.html', title = 'New Tab') {
    const id = 'tab-' + Math.random().toString(36).substring(2, 9);
    const iframe = document.createElement('iframe');
    iframe.id = 'iframe-' + id;
    iframe.src = url;
    iframe.style.display = 'none';
    viewportContainer.appendChild(iframe);

    const tabObj = { id, url, title, iframe };
    tabs.push(tabObj);
    renderTabElement(tabObj);
    switchTab(id);
  }

  function renderTabElement(tab) {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.id = 'tab-element-' + tab.id;
    tabEl.innerHTML = `<span class="tab-favicon">⚡</span><span class="tab-title">${tab.title}</span><span class="tab-close">✕</span>`;

    tabEl.addEventListener('click', (e) => {
      if (!e.target.closest('.tab-close')) switchTab(tab.id);
    });

    tabEl.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    tabStrip.insertBefore(tabEl, newTabBtn);
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

    tabs[index].iframe.remove();
    const tabEl = document.getElementById('tab-element-' + id);
    if (tabEl) tabEl.remove();

    tabs.splice(index, 1);
    if (activeTabId === id) {
      if (tabs.length > 0) switchTab(tabs[Math.max(0, index - 1)].id);
      else createTab();
    }
  }

  function updateAddressBar(url) {
    addressInput.value = url.includes('newtab.html') ? '' : url;
  }

  function navigateCurrentTab(input) {
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab) return;

    let targetUrl = input;
    if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.includes('newtab.html')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = 'https://' + targetUrl;
      } else {
        targetUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(targetUrl);
      }
    }

    tab.url = targetUrl;
    tab.iframe.src = targetUrl;
    updateAddressBar(targetUrl);

    const tabEl = document.getElementById('tab-element-' + tab.id);
    if (tabEl) {
      const titleEl = tabEl.querySelector('.tab-title');
      if (titleEl) titleEl.textContent = targetUrl.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  newTabBtn.addEventListener('click', () => createTab('newtab.html', 'New Tab'));

  addressInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && addressInput.value.trim()) navigateCurrentTab(addressInput.value.trim());
  });

  btnBack.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.iframe.contentWindow) try { tab.iframe.contentWindow.history.back(); } catch (e) {}
  });

  btnForward.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab && tab.iframe.contentWindow) try { tab.iframe.contentWindow.history.forward(); } catch (e) {}
  });

  btnReload.addEventListener('click', () => {
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab) tab.iframe.src = tab.iframe.src;
  });

  btnHome.addEventListener('click', () => navigateCurrentTab('newtab.html'));

  window.addEventListener('message', (event) => {
    if (!event.data) return;
    if (event.data.type === 'NAVIGATE') navigateCurrentTab(event.data.url);
  });

  createTab('newtab.html', 'New Tab');
})();
