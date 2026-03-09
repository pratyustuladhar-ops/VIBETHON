# Link Analytics Shortener

A full‑stack web application that converts long URLs into shortened links and tracks click analytics for each link, complete with a premium frontend UI and a Node.js backend using a file-based JSON persistence layer.

## Folder Structure
```
VIBEATHON/
├── backend/
│   ├── server.js          # Express server with API routes
│   └── package.json       # Project metadata & dependencies
├── public/                # Frontend files served statically
│   ├── index.html         # Premium UI markup
│   ├── style.css          # Glassmorphism dark-mode styling
│   └── app.js             # Client-side API integration logic
├── db.json                # Local JSON database (auto-generated)
├── README.md              # Project documentation
└── .gitignore             # Git ignore rules
```

## Features
- **URL Shortening**: Enter a long URL and get a short, shareable link.
- **Redirection**: Visiting the short link seamlessly redirects to the original destination.
- **Analytics Dashboard**: Tracks the total number of clicks a link has accumulated.
- **Data Persistence**: URLs and click counts are stored locally in `db.json` and persist across server restarts.
- **Input Validation**: Prevents empty or invalid URLs from being shortened.
- **Premium Design**: Built with a sleek dark theme featuring glassmorphism and modern typography.

## Step-by-Step Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine (v14+ recommended).

### 1. Installation
Clone the repository or open the project folder, then install the required dependencies:
```bash
npm install
```
This will install `express`, `cors`, `shortid`, and `valid-url`.

### 2. Running Locally
Start the backend server on your local machine:
```bash
node server.js
```
The server will run on `http://localhost:3000`.

### 3. Usage
Open an internet browser and navigate to:
```
http://localhost:3000
```
- Paste your long URL into the input field and click **Shorten**.
- A new link will appear in the Dashboard.
- Provide that short link to others or click it yourself to see the redirect and watch the view count increase!

## How to Deploy the App and Generate a Live Link

To make this server accessible to the public internet, you can deploy the complete project on free platforms like [Render](https://render.com) or [Railway](https://railway.app).

### Option A: Deploy on Render
1. Create a free account on [Render](https://render.com).
2. Connect your GitHub account and create a new **Web Service**.
3. Point it to this repository.
4. Set the **Build Command** to: `npm install`
5. Set the **Start Command** to: `node server.js`
6. Click **Create Web Service**. Render will give you a public URL (e.g., `https://link-analytics.onrender.com`). *Note: Free tier Render instances spin down on inactivity, so the local file-system `db.json` may wipe periodically.*

### Option B: Using a persistent database
For a production application, replace the local `db.json` with a cloud database like MongoDB or PostgreSQL, which can easily be integrated into `server.js` using Mongoose or Prisma.
