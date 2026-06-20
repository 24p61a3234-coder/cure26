import { ArrowLeft, Clock, Monitor, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { useQueue } from '../hooks/useQueue';
import { minutesLabel } from '../utils/formatters';

export default function WaitingRoom() {
  const { snapshot, loading } = useQueue();
  const trackingUrl = window.location.href;

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-secondary text-white">Loading waiting room...</div>;
  }

  return (
    <main className="min-h-screen bg-secondary text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Monitor className="text-blue-300" size={30} />
          <div>
            <h1 className="text-2xl font-bold">Queue Cure 26</h1>
            <p className="text-sm text-slate-300">Patient waiting room display</p>
          </div>
        </div>
        <Link className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white/15" to="/dashboard">
          <ArrowLeft size={18} />
          Dashboard
        </Link>
      </header>

      <section className="grid gap-6 p-5 sm:p-8 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-white/10 bg-white/10 p-6">
          <p className="text-lg text-blue-200">Current Token Being Served</p>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[7rem] font-black leading-none tracking-normal sm:text-[10rem]">
                {snapshot.stats.currentToken || '-'}
              </p>
              <p className="mt-3 text-2xl font-semibold">{snapshot.servingPatient?.name || 'Please wait for the next call'}</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-secondary">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <QrCode size={18} />
                Track Queue
              </div>
              <QRCodeSVG value={trackingUrl} size={128} className="mt-3" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Next 5 Tokens</h2>
            <Clock className="text-blue-200" size={26} />
          </div>
          <div className="mt-5 space-y-3">
            {snapshot.nextTokens.map((patient, index) => (
              <div key={patient._id} className="flex items-center justify-between rounded-md bg-white/10 px-4 py-4">
                <div>
                  <p className="text-sm text-slate-300">Position {index + 1}</p>
                  <p className="text-3xl font-bold">#{patient.tokenNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{patient.name}</p>
                  <p className="text-sm text-slate-300">
                    {index} ahead, {minutesLabel(index * snapshot.stats.avgConsultationTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {!snapshot.nextTokens.length ? <p className="mt-6 text-slate-300">No waiting patients right now.</p> : null}
        </div>
      </section>

      <section className="grid gap-4 px-5 pb-8 sm:grid-cols-3 sm:px-8">
        <div className="rounded-lg bg-white/10 p-5">
          <p className="text-sm text-slate-300">Tokens Ahead</p>
          <p className="mt-2 text-4xl font-bold">{Math.max(snapshot.stats.waiting - 1, 0)}</p>
        </div>
        <div className="rounded-lg bg-white/10 p-5">
          <p className="text-sm text-slate-300">Estimated Waiting Time</p>
          <p className="mt-2 text-4xl font-bold">{minutesLabel(snapshot.stats.estimatedQueueDuration)}</p>
        </div>
        <div className="rounded-lg bg-white/10 p-5">
          <p className="text-sm text-slate-300">Average Consultation</p>
          <p className="mt-2 text-4xl font-bold">{snapshot.stats.avgConsultationTime} min</p>
        </div>
      </section>
    </main>
  );
}
