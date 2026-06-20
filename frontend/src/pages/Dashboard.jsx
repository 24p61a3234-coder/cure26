import { Clock, ListChecks, Play, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import PatientForm from '../components/PatientForm';
import PatientTable from '../components/PatientTable';
import StatCard from '../components/StatCard';
import { useQueue } from '../hooks/useQueue';
import { queueApi, settingsApi } from '../services/queueService';
import { minutesLabel } from '../utils/formatters';

export default function Dashboard() {
  const { snapshot, loading } = useQueue();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [avgTime, setAvgTime] = useState('');
  const [calling, setCalling] = useState(false);

  const patients = useMemo(() => {
    return snapshot.patients.filter((patient) => {
      const matchesSearch = patient.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || patient.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [snapshot.patients, search, filter]);

  async function callNext() {
    setCalling(true);
    try {
      const data = await queueApi.next();
      toast.success(`Calling token ${data.patient.tokenNumber}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCalling(false);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    try {
      await settingsApi.update({ avgConsultationTime: Number(avgTime || snapshot.stats.avgConsultationTime) });
      toast.success('Consultation time updated');
      setAvgTime('');
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (loading) return <div className="card">Loading live queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Receptionist Dashboard</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Live queue operations</h1>
        </div>
        <button className="btn-primary" onClick={callNext} disabled={calling || !snapshot.stats.waiting}>
          <Play size={18} />
          {calling ? 'Calling...' : 'Call Next Patient'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Current Token" value={snapshot.stats.currentToken || '-'} helper="Being served now" icon={Play} />
        <StatCard title="Patients Waiting" value={snapshot.stats.waiting} helper="Active waiting tokens" icon={Users} />
        <StatCard title="Queue Duration" value={minutesLabel(snapshot.stats.estimatedQueueDuration)} helper="Estimated total wait" icon={Clock} />
        <StatCard title="Completed" value={snapshot.stats.completed} helper="Finished consultations" icon={ListChecks} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <PatientForm />
          <form className="card space-y-4" onSubmit={saveSettings}>
            <div>
              <h2 className="text-lg font-bold">Consultation Time</h2>
              <p className="text-sm text-slate-500">Current average: {snapshot.stats.avgConsultationTime} minutes.</p>
            </div>
            <label className="block space-y-1">
              <span className="label">Average minutes per patient</span>
              <input
                className="input"
                type="number"
                min="1"
                max="240"
                value={avgTime}
                onChange={(e) => setAvgTime(e.target.value)}
                placeholder={String(snapshot.stats.avgConsultationTime)}
              />
            </label>
            <button className="btn-secondary w-full sm:w-auto">Save Setting</button>
          </form>
        </div>
        <PatientTable patients={patients} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />
      </div>
    </div>
  );
}
