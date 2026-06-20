import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setIO } from './config/socket.js';
import { seedDefaultClinicAndUser } from './utils/seed.js';

dotenv.config();

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'],
    credentials: true
  }
});

setIO(io);

io.on('connection', (socket) => {
  socket.on('clinic:join', (clinicId) => {
    if (clinicId) socket.join(`clinic:${clinicId}`);
  });

  socket.on('clinic:leave', (clinicId) => {
    if (clinicId) socket.leave(`clinic:${clinicId}`);
  });
});

async function start() {
  await connectDB();
  await seedDefaultClinicAndUser();
  server.listen(port, () => {
    console.log(`Queue Cure 26 API listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
