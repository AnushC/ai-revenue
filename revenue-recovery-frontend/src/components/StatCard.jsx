import { ArrowUpRight } from "lucide-react";

export default function StatCard({
                                     title,
                                     value,
                                     subtitle,
                                     icon: Icon,
                                 }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-start justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon size={19} />
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <ArrowUpRight size={13} />
                    Live
                </div>

            </div>

            <p className="text-sm text-slate-500">
                {title}
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                {value}
            </h2>

            {subtitle && (
                <p className="mt-2 text-xs text-slate-400">
                    {subtitle}
                </p>
            )}

        </div>
    );
}