if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/service/' }).catch(() => {});
}

function encodeUrl(str) {
  if (!str) return '';
  return encodeURIComponent(
    str
      .split('')
      .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(0) ^ 2) : char))
      .join('')
  );
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

  let proxyUrl = targetUrl;
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    proxyUrl = '/service/' + encodeUrl(targetUrl);
  }

  tab.url = targetUrl;
  tab.iframe.src = proxyUrl;
  updateAddressBar(targetUrl);

  const tabEl = document.getElementById('tab-element-' + tab.id);
  if (tabEl) {
    const titleEl = tabEl.querySelector('.tab-title');
    if (titleEl) {
      titleEl.textContent = targetUrl.replace(/^https?:\/\//, '').split('/')[0] || targetUrl;
    }
  }
}
