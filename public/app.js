// app.js - Frontend logic for Link Analytics Shortener

const apiBase = 'https://vibethon-1.onrender.com';

const urlInput = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const messageDiv = document.getElementById('message');
const linksTableBody = document.querySelector('#links-table tbody');

// Helper to display messages
function showMessage(text, isError = true) {
  messageDiv.textContent = text;
  messageDiv.style.color = isError ? '#ff6b6b' : '#4e9af1';
  setTimeout(() => { messageDiv.textContent = ''; }, 4000);
}

// Fetch and render all links
async function loadLinks() {
  try {
    const res = await fetch(`${apiBase}/api/links`);
    if (!res.ok) throw new Error('Failed to fetch links');
    const links = await res.json();
    linksTableBody.innerHTML = '';
    links.forEach(link => {
      const tr = document.createElement('tr');
      const originalTd = document.createElement('td');
      originalTd.textContent = link.original;
      const shortTd = document.createElement('td');
      const shortLink = document.createElement('a');
      shortLink.href = link.shortUrl || `${window.location.origin}/${link.id}`;
      shortLink.textContent = shortLink.href;
      shortLink.target = '_blank';
      shortTd.appendChild(shortLink);
      const clicksTd = document.createElement('td');
      clicksTd.textContent = link.clicks;
      tr.appendChild(originalTd);
      tr.appendChild(shortTd);
      tr.appendChild(clicksTd);
      linksTableBody.appendChild(tr);
    });
  } catch (err) {
    showMessage(err.message);
  }
}

// Shorten URL handler
shortenBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) {
    showMessage('Please enter a URL');
    return;
  }
  try {
    const res = await fetch(`${apiBase}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to shorten');
    showMessage('Short link created!', false);
    urlInput.value = '';
    await loadLinks();
  } catch (err) {
    showMessage(err.message);
  }
});

// Initial load
loadLinks();
