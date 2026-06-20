import { Plus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { patientApi } from '../services/queueService';

export default function PatientForm() {
  const [form, setForm] = useState({ name: '', age: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.name.trim().length < 2) return toast.error('Enter a valid patient name');
    if (!form.age || Number(form.age) < 0 || Number(form.age) > 130) return toast.error('Enter a valid age');

    setSubmitting(true);
    try {
      const data = await patientApi.create({ ...form, age: Number(form.age) });
      toast.success(`Token ${data.patient.tokenNumber} generated`);
      setForm({ name: '', age: '', phone: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-bold">Add Patient</h2>
        <p className="text-sm text-slate-500">Tokens are generated automatically.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="label">Name</span>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="space-y-1">
          <span className="label">Age</span>
          <input
            className="input"
            type="number"
            min="0"
            max="130"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="label">Phone for SMS-ready notifications</span>
        <input
          className="input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+1 555 0100"
        />
      </label>
      <button className="btn-primary w-full sm:w-auto" disabled={submitting}>
        <Plus size={18} />
        {submitting ? 'Adding...' : 'Generate Token'}
      </button>
    </form>
  );
}
