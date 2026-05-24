# Metu Tracker

A secure, mobile-first Daily Expense Tracker built with **Nuxt 3** and **Google Sheets API**.

## Features

- **Mobile Native Feel:** Beautiful Glassmorphism UI optimized for mobile devices (prevents auto-zoom, uses native numeric keyboards).
- **Secure Authentication:** Built-in session-based login system. No public access allowed.
- **Direct Google Sheets Integration:** Saves all expense data seamlessly to Google Sheets.
- **Smart Tabs:** Automatically creates a new sheet/tab for each new Month & Year (e.g., `Jun2026`).

## Setup & Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/daewu14/metu-tracker.git
   cd metu-tracker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and configure:
   - `AUTH_SECRET`: A random string used to encrypt user sessions.
   - `AUTH_USERS`: JSON array of allowed usernames and passwords.
   - `GOOGLE_CREDENTIALS`: A single-line JSON string containing your Google Service Account credentials. *(Make sure to replace newlines in your private key with literal `\n` characters)*.

4. **Update Spreadsheet ID**
   In `server/api/expenses.post.ts`, update the `spreadsheetId` variable with your own Google Spreadsheet ID. Also, ensure you share the Spreadsheet with your Google Service Account's email as an **Editor**.

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Tech Stack

- [Nuxt 3](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- Vanilla CSS (Glassmorphism design)
- [Google APIs Node.js Client](https://github.com/googleapis/google-api-nodejs-client)

## Security
- This project intentionally ignores `.env` from git. Never commit your secrets to a public repository!
