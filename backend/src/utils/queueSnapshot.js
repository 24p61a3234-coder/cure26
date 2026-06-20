import Patient from '../models/Patient.js';
import ClinicSettings from '../models/ClinicSettings.js';

export async function getOrCreateSettings(clinicId) {
  return ClinicSettings.findOneAndUpdate(
    { clinic: clinicId },
    { $setOnInsert: { clinic: clinicId, avgConsultationTime: 10, currentToken: 0, lastTokenNumber: 0 } },
    { new: true, upsert: true }
  );
}

export async function buildQueueSnapshot(clinicId) {
  const settings = await getOrCreateSettings(clinicId);
  const patients = await Patient.find({ clinic: clinicId }).sort({ tokenNumber: 1, createdAt: 1 });
  const activePatients = patients.filter((patient) => patient.status !== 'completed');
  const waitingPatients = patients.filter((patient) => patient.status === 'waiting');
  const servingPatient = patients.find((patient) => patient.status === 'serving') || null;
  const nextTokens = waitingPatients.slice(0, 5);
  const estimatedQueueDuration = waitingPatients.length * settings.avgConsultationTime;

  return {
    settings,
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
      estimatedQueueDuration,
      avgConsultationTime: settings.avgConsultationTime,
      currentToken: settings.currentToken
    }
  };
}

export function waitEstimateForToken(snapshot, tokenNumber) {
  const index = snapshot.waitingPatients.findIndex((patient) => patient.tokenNumber === Number(tokenNumber));
  if (index < 0) return null;
  return {
    tokenNumber: Number(tokenNumber),
    patientsAhead: index,
    estimatedWaitTime: index * snapshot.settings.avgConsultationTime
  };
}
