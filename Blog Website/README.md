# Inkwell — Blog App

A full-stack blog app rebuilt from scratch:
**React (Vite) + Tailwind CSS v4** frontend + **Node.js / Express** backend,
with **Firebase Realtime Database** for posts and **Firebase Storage** for images.

---

## Project Structure

```
blog-app/
├── backend/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin SDK init
│   │   └── cloudinary.js        # Cloudinary storage details
│   ├── routes/
│   │   └── blogs.js             # GET / POST / DELETE /api/blogs
│   ├── .env                     
│   ├── package.json
│   └── server.js                # Express entry point (port 5000)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── CreatePost.jsx   # Upload form with drag-and-drop
    │   │   ├── BlogCard.jsx     # Individual post card
    │   │   ├── BlogGrid.jsx     # Grid + skeletons + empty state
    │   │   └── Footer.jsx
    │   ├── hooks/
    │   │   └── useBlogs.js      # All API calls in one hook
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css            # Tailwind v4 + custom theme
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## STEP 1. Firebase and Cloudinary Setup

1. Go to https://console.firebase.google.com → create (or open) a project.

2. Enable **Realtime Database**:
   - Build → Realtime Database → Create database → Start in **test mode**

3. Get your **Admin SDK credentials**:
   - Project Settings (gear icon) → Service accounts
   - Click **"Generate new private key"** → download the JSON file
   - You'll find all the values you need inside that JSON

4. Set up **Cloudinary** for image hosting:
   - https://cloudinary.com/ → Sign up → Dashboard
   - Get your **Cloud name**, **API Key**, and **API Secret**
   - Add them to `backend/config/cloudinary.js`

---

## STEP 2. Backend Setup

```powershell
# Navigate into the backend folder
cd blog-app/backend

# Install dependencies
npm install
```

Now open `.env` and fill in the values from your Firebase service account JSON:

```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...XYZ\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> For `FIREBASE_PRIVATE_KEY`, copy the value from the JSON exactly
>     (it has literal `\n` characters). Wrap it in double quotes.

```powershell
# Run in development mode (auto-restarts on save)
npm run dev

# Or just run normally
npm start
```

Backend will be available at **http://localhost:5000**

---

## STEP 3. Frontend Setup

```powershell
# In a new terminal, navigate to the frontend
cd blog-app/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be available at **http://localhost:5173**

The Vite dev server proxies `/api/*` to `http://localhost:5000`
so no CORS issues during development.

---

## STEP 4. Running Both Together

Open **two PowerShell terminals**:

**Terminal 1 — Backend:**
```powershell
cd blog-app/backend
npm run dev
```

**Terminal 2 — Frontend:**
```powershell
cd blog-app/frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## API Reference

| Method   | Endpoint          | Body (multipart)          | Description        |
|----------|-------------------|---------------------------|--------------------|
| GET      | /api/blogs        | —                         | Fetch all posts    |
| POST     | /api/blogs        | `text`, `image` (file)    | Create a new post  |
| DELETE   | /api/blogs/:id    | —                         | Delete a post      |
| GET      | /api/health       | —                         | Health check       |

---

## Production Build

```powershell
# Build the frontend
cd blog-app/frontend
npm run build         # outputs to dist/

# You can serve the frontend statically from the backend
# or deploy frontend → Vercel, backend → Render
```

---

## Firebase Storage — Public Access

The backend calls `fileRef.makePublic()` after each upload.
For production, set proper **Firebase Storage Rules**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      allow read: if true;           // public read
      allow write: if false;         // only server can write
    }
  }
}
```

---

## Troubleshooting

| Issue                         | Fix                                                           |
|-------------------------------|---------------------------------------------------------------|
| `FIREBASE_PRIVATE_KEY` errors | Ensure the key is wrapped in `"..."` and has `\n` line breaks |
| CORS error in browser         | Make sure backend is running on port 5000                     |
| Image not showing             | Check Firebase Storage rules allow public read                |
| `nodemon not found`           | Run `npm install` inside the backend folder                   |
