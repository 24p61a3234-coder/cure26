import { CheckCircle2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import { useQueue } from '../hooks/useQueue';
import { patientApi, queueApi } from '../services/queueService';
import { minutesLabel } from '../utils/formatters';

export default function DoctorDashboard() {
  const { snapshot, loading } = useQueue();

  async function callNext() {
    try {
      const data = await queueApi.next();
      toast.success(`Token ${data.patient.tokenNumber} called`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function completeCurrent() {
    if (!snapshot.servingPatient) return;
    try {
      await patientApi.status(snapshot.servingPatient._id, 'completed');
      toast.success('Consultation completed');
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) return <div className="card">Loading doctor view...</div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">Doctor Dashboard</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Consultation queue</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard title="Now Serving" value={snapshot.servingPatient ? `#${snapshot.servingPatient.tokenNumber}` : '-'} helper={snapshot.servingPatient?.name || 'No patient called'} />
        <StatCard title="Next Tokens" value={snapshot.nextTokens.length} helper="Visible to waiting room" />
        <StatCard title="Remaining Wait" value={minutesLabel(snapshot.stats.estimatedQueueDuration)} helper="Based on average time" />
      </div>

      <section className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Current Consultation</h2>
            <p className="text-sm text-slate-500">
              {snapshot.servingPatient ? `${snapshot.servingPatient.name}, age ${snapshot.servingPatient.age}` : 'No active consultation.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button className="btn-secondary" onClick={completeCurrent} disabled={!snapshot.servingPatient}>
              <CheckCircle2 size={18} />
              Complete
            </button>
            <button className="btn-primary" onClick={callNext} disabled={!snapshot.stats.waiting}>
              <Play size={18} />
              Call Next
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold">Upcoming Patients</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.nextTokens.map((patient, index) => (
            <div key={patient._id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <p className="text-sm text-slate-500">Position {index + 1}</p>
              <p className="text-2xl font-bold">#{patient.tokenNumber}</p>
              <p className="text-sm">{patient.name}</p>
            </div>
          ))}
        </div>
        {!snapshot.nextTokens.length ? <p className="mt-4 text-sm text-slate-500">No upcoming tokens.</p> : null}
      </section>
    </div>
  );
}
