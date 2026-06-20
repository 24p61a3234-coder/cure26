# Queue Cure 26

Queue Cure 26 is a production-ready clinic queue management app that replaces paper token systems with live dashboards, a large patient display, JWT authentication, MongoDB persistence, and Socket.IO updates.

## Features

- Receptionist dashboard at `/dashboard`
- Patient waiting room display at `/waiting-room`
- Doctor dashboard at `/doctor`
- Add, search, filter, delete, call, and complete patient tokens
- Automatic token generation per clinic
- Real-time updates with Socket.IO
- Wait time estimation: `patientsAhead * avgConsultationTime`
- Dashboard analytics and queue statistics
- Dark mode, responsive UI, loading states, empty states, and toast notifications
- JWT protected routes
- Multiple clinic data model
- QR code display for queue tracking
- SMS notification ready service boundary
- PWA manifest and service worker
- Docker and environment variable support

## Tech Stack

Frontend: React, Vite, Tailwind CSS, React Router, Axios, Socket.IO Client.

Backend: Node.js, Express, Socket.IO, MongoDB, Mongoose, JWT, Helmet, rate limiting.

## Project Structure

```text
queue-cure/
  frontend/
    src/
      components/
      pages/
      hooks/
      services/
      context/
  backend/
    src/
      controllers/
      models/
      routes/
      middleware/
      config/
```

## Local Installation

1. Install MongoDB locally or start it with Docker.

2. Copy environment files:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

3. Install dependencies:

```bash
npm install
```

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

Default login:

```text
Email: admin@queuecure.local
Password: Admin123!
```

The backend seeds the default clinic, settings, and admin user automatically on startup.

## Docker

Create `backend/.env` from `backend/.env.example`, then run:

```bash
docker compose up --build
```

The frontend will be available at `http://localhost:5173`, backend at `http://localhost:5000`, and MongoDB at `localhost:27017`.

## API Endpoints

Authentication:

- `POST /api/auth/login`
- `GET /api/auth/me`

Patients:

- `POST /api/patients`
- `GET /api/patients`
- `DELETE /api/patients/:id`
- `PATCH /api/patients/:id/status`
- `GET /api/patients/estimate/:tokenNumber`

Queue:

- `POST /api/queue/next`
- `GET /api/queue/current`

Settings:

- `PUT /api/settings`
- `GET /api/settings`

## Environment Variables

Backend:

```text
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/queue-cure-26
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
DEFAULT_ADMIN_NAME=Receptionist
DEFAULT_ADMIN_EMAIL=admin@queuecure.local
DEFAULT_ADMIN_PASSWORD=Admin123!
```

Frontend:

```text
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Production Notes

- Replace `JWT_SECRET` with a long random value.
- Use a managed MongoDB instance or a secured MongoDB container volume.
- Configure `CLIENT_URL` to the deployed frontend origin.
- Add a real SMS provider in `backend/src/utils/smsService.js`.
- Serve the frontend through the included Nginx Docker image or any static host.
