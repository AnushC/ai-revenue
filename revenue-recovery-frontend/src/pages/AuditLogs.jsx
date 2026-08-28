import { useEffect, useMemo, useState } from "react";
import {
    Search,
    ScrollText,
    Sparkles,
    ShieldCheck,
    TriangleAlert,
    CheckCircle2,
    RotateCcw,
} from "lucide-react";

import { getAllAuditLogs } from "../api/api";

function iconForEvent(eventType) {
    switch (eventType) {
        case "RECOVERY_APPROVED":
            return ShieldCheck;

        case "REVENUE_RECOVERED":
            return CheckCircle2;

        case "AI_FALLBACK":
            return RotateCcw;

        case "RECOVERY_BLOCKED":
        case "RECOVERY_FAILED":
            return TriangleAlert;

        default:
            return Sparkles;
    }
}

function badgeStyle(eventType) {
    if (eventType === "REVENUE_RECOVERED") {
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    if (eventType === "RECOVERY_APPROVED") {
        return "bg-blue-50 text-blue-700 ring-blue-600/20";
    }

    if (
        eventType === "RECOVERY_BLOCKED" ||
        eventType === "RECOVERY_FAILED"
    ) {
        return "bg-red-50 text-red-700 ring-red-600/20";
    }

    if (eventType === "AI_FALLBACK") {
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }

    return "bg-slate-100 text-slate-600 ring-slate-500/20";
}

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState("");
    const [eventFilter, setEventFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadLogs() {
            try {
                const response = await getAllAuditLogs();

                setLogs(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error(err);

                setError(
                    "Could not load audit logs."
                );
            } finally {
                setLoading(false);
            }
        }

        loadLogs();
    }, []);

    const eventTypes = useMemo(() => {
        return [
            ...new Set(
                logs
                    .map((log) => log.eventType)
                    .filter(Boolean)
            ),
        ];
    }, [logs]);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const text =
                `${log.eventType} ${log.message} ${log.revenueRiskId}`
                    .toLowerCase();

            const matchesSearch =
                text.includes(search.toLowerCase());

            const matchesEvent =
                eventFilter === "ALL" ||
                log.eventType === eventFilter;

            return matchesSearch && matchesEvent;
        });
    }, [logs, search, eventFilter]);

    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1500px]">

            <div className="mb-8">

                <p className="mb-1 text-sm font-medium text-indigo-600">
                    Governance & Traceability
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Audit Log
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Review AI decisions, policy actions, fallbacks, failures, and recovery outcomes.
                </p>

            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <ScrollText
                        size={20}
                        className="text-indigo-500"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Total Events
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {logs.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <CheckCircle2
                        size={20}
                        className="text-emerald-600"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Recoveries
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {
                            logs.filter(
                                (log) =>
                                    log.eventType ===
                                    "REVENUE_RECOVERED"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <ShieldCheck
                        size={20}
                        className="text-blue-600"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Approved Actions
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {
                            logs.filter(
                                (log) =>
                                    log.eventType ===
                                    "RECOVERY_APPROVED"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <TriangleAlert
                        size={20}
                        className="text-red-600"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Blocked / Failed
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {
                            logs.filter(
                                (log) =>
                                    log.eventType ===
                                    "RECOVERY_BLOCKED" ||
                                    log.eventType ===
                                    "RECOVERY_FAILED"
                            ).length
                        }
                    </p>
                </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">

                    <div className="relative w-full max-w-md">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search risk ID, event or message..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                        />

                    </div>

                    <select
                        value={eventFilter}
                        onChange={(event) =>
                            setEventFilter(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                    >
                        <option value="ALL">
                            All Events
                        </option>

                        {eventTypes.map(
                            (eventType) => (
                                <option
                                    key={eventType}
                                    value={eventType}
                                >
                                    {eventType.replaceAll(
                                        "_",
                                        " "
                                    )}
                                </option>
                            )
                        )}
                    </select>

                </div>

                <div className="divide-y divide-slate-100">

                    {filteredLogs.map((log) => {
                        const Icon =
                            iconForEvent(
                                log.eventType
                            );

                        return (
                            <div
                                key={log.id}
                                className="flex items-start gap-4 px-6 py-5 transition hover:bg-slate-50"
                            >

                                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                    <Icon size={18} />
                                </div>

                                <div className="min-w-0 flex-1">

                                    <div className="flex items-center gap-3">

                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badgeStyle(
                            log.eventType
                        )}`}
                    >
                      {log.eventType?.replaceAll(
                          "_",
                          " "
                      )}
                    </span>

                                        <span className="text-xs text-slate-400">
                      Risk #{log.revenueRiskId}
                    </span>

                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-slate-700">
                                        {log.message}
                                    </p>

                                    {log.createdAt && (
                                        <p className="mt-2 text-xs text-slate-400">
                                            {new Date(
                                                log.createdAt
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>
                                    )}

                                </div>

                            </div>
                        );
                    })}

                    {filteredLogs.length === 0 && (
                        <div className="py-16 text-center">

                            <ScrollText
                                size={34}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-700">
                                No audit events found
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                AI and recovery workflow activity will appear here.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
