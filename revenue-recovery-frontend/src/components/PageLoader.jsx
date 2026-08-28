export default function PageLoader() {
    return (
        <div className="space-y-6">

            <div className="animate-pulse">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="mt-3 h-8 w-72 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-96 rounded bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                    >
                        <div className="h-10 w-10 rounded-xl bg-slate-100" />
                        <div className="mt-5 h-3 w-24 rounded bg-slate-100" />
                        <div className="mt-3 h-7 w-32 rounded bg-slate-200" />
                    </div>
                ))}

            </div>

            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        </div>
    );
}