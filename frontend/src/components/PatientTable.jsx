import { CheckCircle2, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi } from '../services/queueService';
import { statusBadge } from '../utils/formatters';

export default function PatientTable({ patients, search, setSearch, filter, setFilter }) {
  async function remove(id) {
    try {
      await patientApi.remove(id);
      toast.success('Patient removed');
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function complete(id) {
    try {
      await patientApi.status(id, 'completed');
      toast.success('Marked completed');
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <section className="card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Queue Table</h2>
          <p className="text-sm text-slate-500">Search, filter, complete, or delete tokens.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              className="input pl-10"
              placeholder="Search patient"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select className="input sm:w-40" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="waiting">Waiting</option>
            <option value="serving">Serving</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
            <tr>
              <th className="py-3">Token</th>
              <th>Patient</th>
              <th>Age</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id} className="border-b border-slate-100 dark:border-slate-900">
                <td className="py-3 font-bold">#{patient.tokenNumber}</td>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(patient.status)}`}>
                    {patient.status}
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="btn-secondary px-3" onClick={() => complete(patient._id)} title="Complete">
                      <CheckCircle2 size={16} />
                    </button>
                    <button className="btn-secondary px-3 text-red-600" onClick={() => remove(patient._id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!patients.length ? (
          <div className="py-12 text-center text-sm text-slate-500">No patients match the current view.</div>
        ) : null}
      </div>
    </section>
  );
}
