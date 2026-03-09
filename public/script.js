// DOM Elements
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const errorMsg = document.getElementById('errorMsg');
const successMessage = document.getElementById('successMessage');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const urlsTableBody = document.getElementById('urlsTableBody');
const emptyState = document.getElementById('emptyState');
const totalLinksElement = document.getElementById('totalLinks');
const totalClicksElement = document.getElementById('totalClicks');

// State
let urls = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchUrls();

    // Set interval to refresh data every 5 seconds
    setInterval(fetchUrls, 5000);
});

// Event Listeners
urlForm.addEventListener('submit', handleFormSubmit);
copyBtn.addEventListener('click', () => copyToClipboard(shortUrlDisplay.value));

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();

    const url = urlInput.value.trim();

    // Reset messages
    hideError();
    hideSuccess();

    // Validate URL
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL starting with http:// or https://');
        return;
    }

    // Show loading state
    shortenBtn.classList.add('loading');

    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Show success message
            showSuccess(data.data.shortUrl);

            // Clear input
            urlInput.value = '';

            // Refresh dashboard
            fetchUrls();
        } else {
            showError(data.error || 'Failed to shorten URL');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred. Please try again.');
    } finally {
        shortenBtn.classList.remove('loading');
    }
}

// Fetch all URLs
async function fetchUrls() {
    try {
        const response = await fetch('/api/urls');
        const data = await response.json();

        urls = data;
        updateDashboard();
        updateStats();
    } catch (error) {
        console.error('Error fetching URLs:', error);
    }
}

// Update dashboard table
function updateDashboard() {
    if (urls.length === 0) {
        urlsTableBody.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    const html = urls
        .sort((a, b) => b.id - a.id) // Sort by newest first
        .map(url => `
            <tr>
                <td>
                    <div class="url-cell" title="${url.originalUrl}">
                        ${url.originalUrl}
                    </div>
                </td>
                <td>
                    <a href="${url.shortUrl}" target="_blank" class="short-link">
                        ${url.shortUrl}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                    </a>
                </td>
                <td>
                    <span class="clicks-badge">${url.clicks} clicks</span>
                </td>
                <td class="date-cell">
                    ${formatDate(url.createdAt)}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-copy" onclick="copyToClipboard('${url.shortUrl}')">
                            Copy
                        </button>
                        <button class="btn-delete" onclick="deleteUrl(${url.id})">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    urlsTableBody.innerHTML = html;
}

// Update statistics
function updateStats() {
    const totalLinks = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

    totalLinksElement.textContent = totalLinks;
    totalClicksElement.textContent = totalClicks;
}

// Delete URL
async function deleteUrl(id) {
    if (!confirm('Are you sure you want to delete this link?')) {
        return;
    }

    try {
        const response = await fetch(`/api/urls/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchUrls();
        }
    } catch (error) {
        console.error('Error deleting URL:', error);
        alert('Failed to delete URL');
    }
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);

        // Show feedback
        const copyButtons = document.querySelectorAll('.btn-copy');
        copyButtons.forEach(btn => {
            if (btn.textContent === 'Copy') {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');

                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            }
        });

        // Special handling for main copy button
        if (event && event.target.id === 'copyBtn') {
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');

            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    } catch (error) {
        console.error('Failed to copy:', error);
    }
}

// Utility Functions
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('show');
}

function hideError() {
    errorMsg.classList.remove('show');
    errorMsg.textContent = '';
}

function showSuccess(shortUrl) {
    shortUrlDisplay.value = shortUrl;
    successMessage.classList.add('show');
}

function hideSuccess() {
    successMessage.classList.remove('show');
}
