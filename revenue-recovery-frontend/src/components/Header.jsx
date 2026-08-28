import {
    Bell,
    Search,
    Sparkles,
} from "lucide-react";

export default function Header() {
    return (
        <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">

            <div className="relative hidden w-80 md:block">

                <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    placeholder="Search revenue risks..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                />

            </div>

            <div className="ml-auto flex items-center gap-3">

                <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">

                    <Sparkles
                        size={14}
                        className="text-emerald-600"
                    />

                    <span className="text-xs font-medium text-emerald-700">
            Gemini Agent Active
          </span>

                </div>

                <button className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">
                    <Bell size={18} />
                </button>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    A
                </div>

            </div>

        </header>
    );
}