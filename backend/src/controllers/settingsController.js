import ClinicSettings from '../models/ClinicSettings.js';
import { isMemoryMode } from '../config/db.js';
import { emitClinicUpdate } from '../config/socket.js';
import { buildQueueSnapshot, getOrCreateSettings } from '../utils/queueSnapshot.js';
import { memoryStore } from '../utils/memoryStore.js';

export async function getSettings(req, res, next) {
  try {
    if (isMemoryMode()) {
      return res.json({ settings: memoryStore.getSettings() });
    }

    const settings = await getOrCreateSettings(req.clinicId);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const avgConsultationTime = Number(req.body.avgConsultationTime);
    if (!Number.isInteger(avgConsultationTime) || avgConsultationTime < 1 || avgConsultationTime > 240) {
      return res.status(400).json({ message: 'Average consultation time must be 1 to 240 minutes' });
    }

    if (isMemoryMode()) {
      const settings = memoryStore.updateSettings(avgConsultationTime);
      const snapshot = memoryStore.snapshot();
      emitClinicUpdate(req.clinicId, snapshot);
      return res.json({ settings, snapshot });
    }

    const settings = await ClinicSettings.findOneAndUpdate(
      { clinic: req.clinicId },
      { avgConsultationTime },
      { new: true, upsert: true }
    );

    const snapshot = await buildQueueSnapshot(req.clinicId);
    emitClinicUpdate(req.clinicId, snapshot);
    res.json({ settings, snapshot });
  } catch (error) {
    next(error);
  }
}
