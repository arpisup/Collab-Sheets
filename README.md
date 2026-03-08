# Collab Sheets

A real-time collaborative spreadsheet app built with Next.js, React, Socket.IO, Firebase Auth, and Zustand.

## Features

- Real-time multi-user cell updates
- Presence indicators (who is online and active cell)
- Formula support:
  - `SUM`
  - `AVERAGE` / `AVG`
  - `MIN`
  - `MAX`
  - `COUNT`
  - direct arithmetic like `=A1+B2*2`
- Guest login with display name
- Google sign-in with Firebase Authentication
- Dashboard with search and document cards

## Tech Stack

- Next.js 14 (Pages Router)
- React 18 + TypeScript
- Socket.IO (client + server)
- Zustand (state management)
- Firebase Auth + Firestore SDK
- MathJS (formula evaluation)

## Project Structure

```text
components/
  Dashboard/
  Presence/
  Spreadsheet/
lib/
  firebase.ts
  formula.ts
  socket.ts
pages/
  api/
  editor/
store/
styles/
server.js
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env.local` and fill values:

```dotenv
NEXT_PUBLIC_FIREBASE_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT=your_project_id
```

### 3. Run in development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm start
```

`npm start` runs `server.js`, which is required for Socket.IO in production.

## Deploy on Render

1. Push this repo to GitHub.
2. In Render, create a new **Web Service** from your repo.
3. Use:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables from `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_KEY`
   - `NEXT_PUBLIC_FIREBASE_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT`
5. Deploy.

### Firebase Setup Required for Google Sign-In

In Firebase Console:

1. Go to **Authentication -> Sign-in method**
2. Enable **Google** provider
3. Go to **Authentication -> Settings -> Authorized domains**
4. Add your Render domain (for example: `your-app.onrender.com`)

If this is not configured, Google login will fail with domain/provider errors.

## Testing Checklist

- Login as Guest works
- Google sign-in works
- Dashboard loads document list
- Formula evaluation works (e.g. `=SUM(A1:A3)`)
- Two browser windows sync edits in real-time
- Presence bar shows collaborator and active cell

## Scripts

- `npm run dev` - start dev server
- `npm run build` - create production build
- `npm start` - start production server (`server.js`)
