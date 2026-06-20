let ioInstance;

export function setIO(io) {
  ioInstance = io;
}

export function getIO() {
  return ioInstance;
}

export function emitClinicUpdate(clinicId, payload) {
  if (!ioInstance) return;
  ioInstance.to(`clinic:${clinicId}`).emit('queue:update', payload);
}
