const styles = {
    OPEN:
        "bg-amber-50 text-amber-700 ring-amber-600/20",

    IN_RECOVERY:
        "bg-blue-50 text-blue-700 ring-blue-600/20",

    RECOVERED:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    FAILED:
        "bg-red-50 text-red-700 ring-red-600/20",

    LOST:
        "bg-red-50 text-red-700 ring-red-600/20",

    STOPPED:
        "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                styles[status] ??
                "bg-slate-100 text-slate-600 ring-slate-500/20"
            }`}
        >
      {status?.replaceAll("_", " ") ?? "UNKNOWN"}
    </span>
    );
}