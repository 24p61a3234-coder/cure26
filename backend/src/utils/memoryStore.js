import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const clinic = {
  _id: 'dev-clinic',
  id: 'dev-clinic',
  name: 'Queue Cure Main Clinic',
  slug: 'main-clinic'
};

const admin = {
  _id: 'dev-admin',
  id: 'dev-admin',
  name: process.env.DEFAULT_ADMIN_NAME || 'Receptionist',
  email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@queuecure.local',
  role: 'admin',
  clinic
};

const state = {
  patients: [],
  settings: {
    _id: 'dev-settings',
    clinic: clinic._id,
    avgConsultationTime: 10,
    currentToken: 0,
    lastTokenNumber: 0
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function snapshot() {
  const patients = clone(state.patients).sort((a, b) => a.tokenNumber - b.tokenNumber);
  const activePatients = patients.filter((patient) => patient.status !== 'completed');
  const waitingPatients = patients.filter((patient) => patient.status === 'waiting');
  const servingPatient = patients.find((patient) => patient.status === 'serving') || null;
  const nextTokens = waitingPatients.slice(0, 5);

  return {
    settings: clone(state.settings),
    patients,
    activePatients,
    waitingPatients,
    servingPatient,
    nextTokens,
    stats: {
      totalPatients: patients.length,
      waiting: waitingPatients.length,
      serving: servingPatient ? 1 : 0,
      completed: patients.filter((patient) => patient.status === 'completed').length,
      estimatedQueueDuration: waitingPatients.length * state.settings.avgConsultationTime,
      avgConsultationTime: state.settings.avgConsultationTime,
      currentToken: state.settings.currentToken
    }
  };
}

export const memoryStore = {
  clinic,
  admin,

  login({ email, password }) {
    const expectedEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@queuecure.local';
    const expectedPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
    if (email?.toLowerCase() !== expectedEmail || password !== expectedPassword) return null;
    const secret = process.env.JWT_SECRET || 'queue-cure-26-development-secret';
    return {
      token: jwt.sign({ id: admin._id, role: admin.role, memory: true }, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      }),
      user: clone(admin)
    };
  },

  currentUser() {
    return clone(admin);
  },

  listPatients({ search, status, tokenNumber } = {}) {
    return snapshot().patients.filter((patient) => {
      const matchesSearch = !search || patient.name.toLowerCase().includes(String(search).toLowerCase());
      const matchesStatus = !status || status === 'all' || patient.status === status;
      const matchesToken = !tokenNumber || patient.tokenNumber === Number(tokenNumber);
      return matchesSearch && matchesStatus && matchesToken;
    });
  },

  addPatient({ name, age, phone }) {
    state.settings.lastTokenNumber += 1;
    const now = new Date().toISOString();
    const patient = {
      _id: randomUUID(),
      name: String(name).trim(),
      age: Number(age),
      phone: phone ? String(phone).trim() : '',
      tokenNumber: state.settings.lastTokenNumber,
      status: 'waiting',
      clinic: clinic._id,
      createdAt: now,
      updatedAt: now
    };
    state.patients.push(patient);
    return clone(patient);
  },

  deletePatient(id) {
    const index = state.patients.findIndex((patient) => patient._id === id);
    if (index < 0) return null;
    const [patient] = state.patients.splice(index, 1);
    return clone(patient);
  },

  updateStatus(id, status) {
    const patient = state.patients.find((item) => item._id === id);
    if (!patient) return null;
    if (status === 'serving') {
      state.patients.forEach((item) => {
        if (item.status === 'serving' && item._id !== id) {
          item.status = 'completed';
          item.completedAt = new Date().toISOString();
        }
      });
      state.settings.currentToken = patient.tokenNumber;
      patient.calledAt = new Date().toISOString();
    }
    if (status === 'completed') patient.completedAt = new Date().toISOString();
    patient.status = status;
    patient.updatedAt = new Date().toISOString();
    return clone(patient);
  },

  callNext() {
    const next = state.patients
      .filter((patient) => patient.status === 'waiting')
      .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];
    if (!next) return null;
    return this.updateStatus(next._id, 'serving');
  },

  getSettings() {
    return clone(state.settings);
  },

  updateSettings(avgConsultationTime) {
    state.settings.avgConsultationTime = Number(avgConsultationTime);
    return clone(state.settings);
  },

  estimate(tokenNumber) {
    const current = snapshot();
    const index = current.waitingPatients.findIndex((patient) => patient.tokenNumber === Number(tokenNumber));
    if (index < 0) return null;
    return {
      tokenNumber: Number(tokenNumber),
      patientsAhead: index,
      estimatedWaitTime: index * current.settings.avgConsultationTime
    };
  },

  snapshot
};
