import { useEffect, useMemo, useState } from "react";
import { Search, Filter, ArrowUpRight, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

import { getRevenueRisks } from "../api/api";
import StatusBadge from "../components/StatusBadge";

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function riskLevel(score) {
    const value = Number(score ?? 0);

    if (value >= 0.8) return "HIGH";
    if (value >= 0.5) return "MEDIUM";
    return "LOW";
}

function RiskLevelBadge({ score }) {
    const level = riskLevel(score);

    const styles = {
        HIGH: "bg-red-50 text-red-700 ring-red-600/20",
        MEDIUM: "bg-amber-50 text-amber-700 ring-amber-600/20",
        LOW: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    };

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[level]}`}
        >
      {level}
    </span>
    );
}

export default function RevenueRisks() {
    const [risks, setRisks] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [riskFilter, setRiskFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadRisks() {
            try {
                const response = await getRevenueRisks();

                setRisks(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );
            } catch (err) {
                console.error(err);
                setError(
                    "Could not load revenue risks. Make sure the Spring Boot backend is running."
                );
            } finally {
                setLoading(false);
            }
        }

        loadRisks();
    }, []);

    const filteredRisks = useMemo(() => {
        return risks.filter((risk) => {
            const searchable =
                `${risk.id} ${risk.reason} ${risk.status}`
                    .toLowerCase();

            const matchesSearch =
                searchable.includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                risk.status === statusFilter;

            const matchesRisk =
                riskFilter === "ALL" ||
                riskLevel(risk.riskScore) === riskFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRisk
            );
        });
    }, [
        risks,
        search,
        statusFilter,
        riskFilter,
    ]);

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
                    Risk Intelligence
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Revenue Risks
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Review failed payments, risk scores, and recovery status.
                </p>

            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Total Risks
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {risks.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Open Risks
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {
                            risks.filter(
                                (risk) => risk.status === "OPEN"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        High Risk
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {
                            risks.filter(
                                (risk) =>
                                    riskLevel(risk.riskScore) ===
                                    "HIGH"
                            ).length
                        }
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">
                        Amount at Risk
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {money(
                            risks.reduce(
                                (sum, risk) =>
                                    sum +
                                    Number(
                                        risk.amountAtRisk ?? 0
                                    ),
                                0
                            )
                        )}
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
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search risk ID, reason or status..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white"
                        />

                    </div>

                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Filter size={16} />
                            Filters
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                        >
                            <option value="ALL">
                                All Statuses
                            </option>
                            <option value="OPEN">
                                Open
                            </option>
                            <option value="IN_RECOVERY">
                                In Recovery
                            </option>
                            <option value="RECOVERED">
                                Recovered
                            </option>
                            <option value="LOST">
                                Lost
                            </option>
                            <option value="STOPPED">
                                Stopped
                            </option>
                        </select>

                        <select
                            value={riskFilter}
                            onChange={(event) =>
                                setRiskFilter(
                                    event.target.value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
                        >
                            <option value="ALL">
                                All Risk Levels
                            </option>
                            <option value="HIGH">
                                High
                            </option>
                            <option value="MEDIUM">
                                Medium
                            </option>
                            <option value="LOW">
                                Low
                            </option>
                        </select>

                    </div>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-left">

                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                        <tr>
                            <th className="px-6 py-3">
                                Risk
                            </th>
                            <th className="px-6 py-3">
                                Failure Reason
                            </th>
                            <th className="px-6 py-3">
                                Amount
                            </th>
                            <th className="px-6 py-3">
                                Score
                            </th>
                            <th className="px-6 py-3">
                                Risk Level
                            </th>
                            <th className="px-6 py-3">
                                Status
                            </th>
                            <th className="px-6 py-3">
                            </th>
                        </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                        {filteredRisks.map((risk) => (

                            <tr
                                key={risk.id}
                                className="transition hover:bg-slate-50"
                            >

                                <td className="px-6 py-4">

                                    <div className="flex items-center gap-3">

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                            <TriangleAlert size={17} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                Risk #{risk.id}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                Revenue leakage
                                            </p>
                                        </div>

                                    </div>

                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {risk.reason?.replaceAll(
                                        "_",
                                        " "
                                    )}
                                </td>

                                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                    {money(
                                        risk.amountAtRisk
                                    )}
                                </td>

                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {Number(
                                        risk.riskScore ?? 0
                                    ).toFixed(2)}
                                </td>

                                <td className="px-6 py-4">
                                    <RiskLevelBadge
                                        score={risk.riskScore}
                                    />
                                </td>

                                <td className="px-6 py-4">
                                    <StatusBadge
                                        status={risk.status}
                                    />
                                </td>

                                <td className="px-6 py-4 text-right">

                                    <Link
                                        to={`/risks/${risk.id}`}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View details
                                        <ArrowUpRight size={15} />
                                    </Link>

                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                    {filteredRisks.length === 0 && (
                        <div className="py-16 text-center">

                            <TriangleAlert
                                size={30}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-600">
                                No revenue risks found
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Try changing your search or filters.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
