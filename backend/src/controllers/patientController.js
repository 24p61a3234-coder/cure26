import Patient from '../models/Patient.js';
import ClinicSettings from '../models/ClinicSettings.js';
import { isMemoryMode } from '../config/db.js';
import { emitClinicUpdate } from '../config/socket.js';
import { buildQueueSnapshot, waitEstimateForToken } from '../utils/queueSnapshot.js';
import { memoryStore } from '../utils/memoryStore.js';

async function publish(clinicId) {
  const snapshot = isMemoryMode() ? memoryStore.snapshot() : await buildQueueSnapshot(clinicId);
  emitClinicUpdate(clinicId, snapshot);
  return snapshot;
}

export async function getPatients(req, res, next) {
  try {
    const { status, search, tokenNumber } = req.query;
    const query = { clinic: req.clinicId };
    if (status && status !== 'all') query.status = status;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (tokenNumber) query.tokenNumber = Number(tokenNumber);

    if (isMemoryMode()) {
      return res.json({ patients: memoryStore.listPatients({ status, search, tokenNumber }) });
    }

    const patients = await Patient.find(query).sort({ tokenNumber: 1 });
    res.json({ patients });
  } catch (error) {
    next(error);
  }
}

export async function createPatient(req, res, next) {
  try {
    const { name, age, phone } = req.body;
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Patient name must be at least 2 characters' });
    }
    if (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 130) {
      return res.status(400).json({ message: 'Age must be between 0 and 130' });
    }

    if (isMemoryMode()) {
      const patient = memoryStore.addPatient({ name, age, phone });
      const snapshot = await publish(req.clinicId);
      return res.status(201).json({ patient, snapshot });
    }

    const settings = await ClinicSettings.findOneAndUpdate(
      { clinic: req.clinicId },
      { $inc: { lastTokenNumber: 1 }, $setOnInsert: { avgConsultationTime: 10, currentToken: 0 } },
      { upsert: true, new: true }
    );

    const patient = await Patient.create({
      name: String(name).trim(),
      age: Number(age),
      phone: phone ? String(phone).trim() : '',
      tokenNumber: settings.lastTokenNumber,
      clinic: req.clinicId
    });

    const snapshot = await publish(req.clinicId);
    res.status(201).json({ patient, snapshot });
  } catch (error) {
    next(error);
  }
}

export async function deletePatient(req, res, next) {
  try {
    if (isMemoryMode()) {
      const patient = memoryStore.deletePatient(req.params.id);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      const snapshot = await publish(req.clinicId);
      return res.json({ message: 'Patient deleted', snapshot });
    }

    const patient = await Patient.findOneAndDelete({ _id: req.params.id, clinic: req.clinicId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const snapshot = await publish(req.clinicId);
    res.json({ message: 'Patient deleted', snapshot });
  } catch (error) {
    next(error);
  }
}

export async function updatePatientStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['waiting', 'serving', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (isMemoryMode()) {
      const patient = memoryStore.updateStatus(req.params.id, status);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      const snapshot = await publish(req.clinicId);
      return res.json({ patient, snapshot });
    }

    const update = { status };
    if (status === 'completed') update.completedAt = new Date();
    if (status === 'serving') update.calledAt = new Date();

    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, clinic: req.clinicId },
      update,
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    if (status === 'serving') {
      await Patient.updateMany(
        { clinic: req.clinicId, _id: { $ne: patient._id }, status: 'serving' },
        { status: 'completed', completedAt: new Date() }
      );
      await ClinicSettings.findOneAndUpdate({ clinic: req.clinicId }, { currentToken: patient.tokenNumber });
    }

    const snapshot = await publish(req.clinicId);
    res.json({ patient, snapshot });
  } catch (error) {
    next(error);
  }
}

export async function getPatientEstimate(req, res, next) {
  try {
    if (isMemoryMode()) {
      const estimate = memoryStore.estimate(req.params.tokenNumber);
      if (!estimate) return res.status(404).json({ message: 'Waiting token not found' });
      return res.json(estimate);
    }

    const snapshot = await buildQueueSnapshot(req.clinicId);
    const estimate = waitEstimateForToken(snapshot, req.params.tokenNumber);
    if (!estimate) return res.status(404).json({ message: 'Waiting token not found' });
    res.json(estimate);
  } catch (error) {
    next(error);
  }
}
