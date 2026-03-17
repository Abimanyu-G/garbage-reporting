# Garbage Reporting System Backend (Node.js)

This backend matches the frontend API used in `src/services/api.js`.

## Requirements

- Node.js 18+ recommended

## Setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` if needed:
- `PORT` default is `5000`
- `CORS_ORIGIN` should include your Vite dev URL (e.g. `http://localhost:5174`)
- `JWT_SECRET` must be set to something secret in production
- `UPLOAD_DIR` is where complaint photos are stored (defaults to `./uploads`)

## Run

```bash
npm run dev
```

Server will start on `http://localhost:5000` and expose routes under `/api`.

## API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Complaints (JWT required)
- `POST /api/complaints`
- `GET /api/complaints/user`
- `GET /api/complaints` (admin only)
- `PATCH /api/complaints/:id/status` (admin only)

## Admin

If a user registers with the email that matches `ADMIN_EMAIL`, they will get role `admin`.

## Notes on uploads / persistence

This project saves complaint photos to the local filesystem and serves them at `/uploads/...`.
On hosts like Render, set `UPLOAD_DIR` to a folder on a **persistent disk mount** (for example: `/var/data/uploads`)
so images remain available after redeploys.
