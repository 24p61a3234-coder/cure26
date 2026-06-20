export default function StatCard({ title, value, helper, icon: Icon }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
          {helper ? <p className="mt-1 text-sm text-slate-500">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className="grid h-10 w-10 place-items-center rounded-md bg-blue-50 text-primary dark:bg-blue-950">
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
