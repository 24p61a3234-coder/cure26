import Patient from '../models/Patient.js';
import ClinicSettings from '../models/ClinicSettings.js';
import { isMemoryMode } from '../config/db.js';
import { emitClinicUpdate } from '../config/socket.js';
import { buildQueueSnapshot } from '../utils/queueSnapshot.js';
import { queueSmsNotification } from '../utils/smsService.js';
import { memoryStore } from '../utils/memoryStore.js';

async function publish(clinicId) {
  const snapshot = isMemoryMode() ? memoryStore.snapshot() : await buildQueueSnapshot(clinicId);
  emitClinicUpdate(clinicId, snapshot);
  return snapshot;
}

export async function callNextPatient(req, res, next) {
  try {
    if (isMemoryMode()) {
      const patient = memoryStore.callNext();
      if (!patient) return res.status(404).json({ message: 'No waiting patients in queue' });
      await queueSmsNotification({
        phone: patient.phone,
        message: `Token ${patient.tokenNumber} is now being served.`
      });
      const snapshot = await publish(req.clinicId);
      return res.json({ patient, snapshot });
    }

    const nextPatient = await Patient.findOne({ clinic: req.clinicId, status: 'waiting' }).sort({
      tokenNumber: 1
    });

    if (!nextPatient) {
      return res.status(404).json({ message: 'No waiting patients in queue' });
    }

    await Patient.updateMany(
      { clinic: req.clinicId, status: 'serving' },
      { status: 'completed', completedAt: new Date() }
    );

    nextPatient.status = 'serving';
    nextPatient.calledAt = new Date();
    await nextPatient.save();
    await ClinicSettings.findOneAndUpdate(
      { clinic: req.clinicId },
      { currentToken: nextPatient.tokenNumber },
      { upsert: true }
    );

    await queueSmsNotification({
      phone: nextPatient.phone,
      message: `Token ${nextPatient.tokenNumber} is now being served.`
    });

    const snapshot = await publish(req.clinicId);
    res.json({ patient: nextPatient, snapshot });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentQueue(req, res, next) {
  try {
    const snapshot = isMemoryMode() ? memoryStore.snapshot() : await buildQueueSnapshot(req.clinicId);
    res.json(snapshot);
  } catch (error) {
    next(error);
  }
}
