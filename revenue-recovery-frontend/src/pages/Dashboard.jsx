import { useEffect, useState } from "react";

import {
    IndianRupee,
    TrendingUp,
    TriangleAlert,
    RefreshCcw,
    ArrowRight,
} from "lucide-react";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { Link } from "react-router-dom";

import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";


import {
    getDashboardAnalytics,
    getRevenueRisks,
    getRecoveryTrend,
} from "../api/api";







function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

export default function Dashboard() {

    const [analytics, setAnalytics] =
        useState(null);

    const [risks, setRisks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");
    const [trend, setTrend] =
        useState([]);


    useEffect(() => {

        async function loadDashboard() {

            try {

                const [
                    analyticsResponse,
                    risksResponse,
                    trendResponse,
                ] = await Promise.all([
                    getDashboardAnalytics(),
                    getRevenueRisks(),
                    getRecoveryTrend(),
                ]);

                setAnalytics(
                    analyticsResponse.data
                );

                setTrend(
                    Array.isArray(trendResponse.data)
                        ? trendResponse.data
                        : []
                );

                setRisks(
                    Array.isArray(risksResponse.data)
                        ? risksResponse.data
                        : []
                );

            } catch (err) {

                console.error(err);

                setError(
                    "Could not load dashboard data. Make sure the Spring Boot backend is running."
                );

            } finally {

                setLoading(false);

            }
        }

        loadDashboard();

    }, []);

    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1500px]">

            <div className="mb-8 flex items-end justify-between">

                <div>

                    <p className="mb-1 text-sm font-medium text-indigo-600">
                        Revenue Intelligence
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Recovery Overview
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Monitor revenue at risk and AI-powered recovery performance.
                    </p>

                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
                    Live backend data
                </div>

            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                <StatCard
                    title="Revenue at Risk"
                    value={money(
                        analytics?.totalRevenueAtRisk
                    )}
                    subtitle="Across detected payment risks"
                    icon={TriangleAlert}
                />

                <StatCard
                    title="Revenue Recovered"
                    value={money(
                        analytics?.totalRevenueRecovered
                    )}
                    subtitle="Recovered by workflows"
                    icon={IndianRupee}
                />

                <StatCard
                    title="Recovery Rate"
                    value={`${Number(
                        analytics?.recoveryRate ?? 0
                    ).toFixed(1)}%`}
                    subtitle="Revenue recovery efficiency"
                    icon={TrendingUp}
                />

                <StatCard
                    title="Recovery Attempts"
                    value={
                        analytics?.totalRecoveryAttempts ??
                        0
                    }
                    subtitle="AI-guided interventions"
                    icon={RefreshCcw}
                />

            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="mb-6">

                        <h2 className="font-semibold text-slate-900">
                            Revenue Recovery
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Recovered revenue performance
                        </p>

                    </div>

                    <div className="h-[280px]">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <AreaChart data={trend}>

                                <defs>
                                    <linearGradient
                                        id="recoveryGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#6366f1"
                                            stopOpacity={0.25}
                                        />

                                        <stop
                                            offset="95%"
                                            stopColor="#6366f1"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e2e8f0"
                                />


                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) =>
                                        new Date(value).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "short",
                                            }
                                        )
                                    }
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12 }}
                                />

                                <Tooltip />

                                <Area
                                    type="monotone"
                                    dataKey="amountRecovered"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fill="url(#recoveryGradient)"
                                />

                            </AreaChart>
                        </ResponsiveContainer>

                    </div>

                </div>

                <div className="rounded-2xl bg-[#111827] p-6 text-white shadow-sm">

                    <div className="mb-7 flex items-center justify-between">

                        <div>

                            <p className="text-sm text-slate-400">
                                AI Recovery Agent
                            </p>

                            <h2 className="mt-1 text-xl font-semibold">
                                Gemini
                            </h2>

                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20">
              <span className="text-xl">
                ✦
              </span>
                        </div>

                    </div>

                    <div className="space-y-5">

                        <div>
                            <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-400">
                  Agent status
                </span>

                                <span className="text-emerald-400">
                  ● Active
                </span>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-5">

                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Successful Recoveries
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {analytics?.successfulRecoveries ??
                                    0}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Failed Attempts
                            </p>

                            <p className="mt-2 text-2xl font-semibold">
                                {analytics?.failedRecoveries ??
                                    0}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                    <div>

                        <h2 className="font-semibold text-slate-900">
                            Recent Revenue Risks
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Latest detected revenue leakage
                        </p>

                    </div>

                    <Link
                        to="/risks"
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600"
                    >
                        View all
                        <ArrowRight size={15} />
                    </Link>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-left">

                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">

                        <tr>
                            <th className="px-6 py-3">
                                Risk
                            </th>

                            <th className="px-6 py-3">
                                Reason
                            </th>

                            <th className="px-6 py-3">
                                Amount
                            </th>

                            <th className="px-6 py-3">
                                Score
                            </th>

                            <th className="px-6 py-3">
                                Status
                            </th>

                            <th className="px-6 py-3">
                            </th>
                        </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                        {risks
                            .slice(-5)
                            .reverse()
                            .map((risk) => (

                                <tr
                                    key={risk.id}
                                    className="transition hover:bg-slate-50"
                                >

                                    <td className="px-6 py-4">

                                        <p className="text-sm font-medium text-slate-900">
                                            Risk #{risk.id}
                                        </p>

                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {risk.reason?.replaceAll(
                                            "_",
                                            " "
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                        {money(
                                            risk.amountAtRisk
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {risk.riskScore ??
                                            "—"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge
                                            status={risk.status}
                                        />
                                    </td>

                                    <td className="px-6 py-4 text-right">

                                        <Link
                                            to={`/risks/${risk.id}`}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            View
                                        </Link>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                    {risks.length === 0 && (
                        <div className="p-10 text-center text-sm text-slate-500">
                            No revenue risks detected yet.
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
