import { useEffect, useState } from "react";
import {
    Play,
    RefreshCcw,
    CheckCircle2,
    XCircle,
    UserCheck,
    ShieldAlert,
    IndianRupee,
    TrendingUp,
} from "lucide-react";

import {
    getDashboardAnalytics,
    getRevenueRisks,
    runBatchRecovery,
} from "../api/api";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

function ResultCard({
                        title,
                        value,
                        icon: Icon,
                    }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

export default function RecoveryCenter() {
    const [analytics, setAnalytics] =
        useState(null);

    const [risks, setRisks] =
        useState([]);

    const [batchResult, setBatchResult] =
        useState(null);

    const [running, setRunning] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        batchModalOpen,
        setBatchModalOpen,
    ] = useState(false);

    async function loadPage() {
        try {
            const [
                analyticsResponse,
                risksResponse,
            ] = await Promise.all([
                getDashboardAnalytics(),
                getRevenueRisks(),
            ]);

            setAnalytics(
                analyticsResponse.data
            );

            setRisks(
                Array.isArray(risksResponse.data)
                    ? risksResponse.data
                    : []
            );
        } catch (err) {
            console.error(err);

            setError(
                "Could not load recovery data."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPage();
    }, []);

    async function handleBatchRecovery() {
        setRunning(true);
        setError("");

        try {
            const response =
                await runBatchRecovery();

            setBatchResult(

                response.data
            );
            toast.error(
                "Batch recovery failed"
            );

            await loadPage();
        } catch (err) {
            console.error(err);

            setError(
                "Batch recovery failed. Check the Spring Boot console."
            );
            toast.error("Batch recovery failed");
        } finally {
            setRunning(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
            </div>
        );
    }

    const openCases =
        risks.filter(
            (risk) =>
                risk.status === "OPEN"
        );

    const recoveredCases =
        risks.filter(
            (risk) =>
                risk.status === "RECOVERED"
        );

    return (
        <div className="mx-auto max-w-[1500px]">

            <div className="mb-8 flex items-end justify-between">

                <div>

                    <p className="mb-1 text-sm font-medium text-indigo-600">
                        Workflow Automation
                    </p>

                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                        Recovery Center
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Run AI-assisted recovery workflows across open revenue risks.
                    </p>

                </div>

                <button
                    onClick={() =>
                        setBatchModalOpen(true)


                    }
                    disabled={
                        running ||
                        openCases.length === 0
                    }
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Play size={17} />

                    {running
                        ? "Running batch..."
                        : `Run Batch Recovery (${openCases.length})`}
                </button>

            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                <ResultCard
                    title="Open Cases"
                    value={openCases.length}
                    icon={RefreshCcw}
                />

                <ResultCard
                    title="Recovered Cases"
                    value={
                        recoveredCases.length
                    }
                    icon={CheckCircle2}
                />

                <ResultCard
                    title="Revenue Recovered"
                    value={money(
                        analytics
                            ?.totalRevenueRecovered
                    )}
                    icon={IndianRupee}
                />

                <ResultCard
                    title="Recovery Rate"
                    value={`${Number(
                        analytics?.recoveryRate ??
                        0
                    ).toFixed(1)}%`}
                    icon={TrendingUp}
                />

            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <h2 className="font-semibold text-slate-900">
                            Active Recovery Queue
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Open cases currently eligible for AI-guided recovery.
                        </p>

                    </div>

                    <div className="divide-y divide-slate-100">

                        {openCases.length === 0 && (
                            <div className="py-16 text-center">

                                <CheckCircle2
                                    size={34}
                                    className="mx-auto text-emerald-400"
                                />

                                <p className="mt-3 text-sm font-medium text-slate-700">
                                    Recovery queue is clear
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    There are currently no open revenue risks.
                                </p>

                            </div>
                        )}

                        {openCases.map(
                            (risk) => (

                                <div
                                    key={risk.id}
                                    className="flex items-center justify-between px-6 py-5"
                                >

                                    <div>

                                        <p className="text-sm font-medium text-slate-900">
                                            Risk #{risk.id}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {risk.reason?.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </p>

                                    </div>

                                    <div className="flex items-center gap-8">

                                        <div className="text-right">

                                            <p className="text-xs text-slate-400">
                                                Amount at Risk
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {money(
                                                    risk.amountAtRisk
                                                )}
                                            </p>

                                        </div>

                                        <div className="text-right">

                                            <p className="text-xs text-slate-400">
                                                Risk Score
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                                {Number(
                                                    risk.riskScore ??
                                                    0
                                                ).toFixed(2)}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

                <div className="rounded-2xl bg-[#111827] p-6 text-white shadow-sm">

                    <p className="text-sm text-slate-400">
                        Recovery Engine
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                        Agentic Workflow
                    </h2>

                    <div className="mt-6 space-y-5">

                        <div className="flex gap-3">

                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                                1
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Gemini analysis
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Diagnose each payment failure and choose an intervention.
                                </p>
                            </div>

                        </div>

                        <div className="flex gap-3">

                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                                2
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Policy validation
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Enforce retry limits, fraud rules and stopping conditions.
                                </p>
                            </div>

                        </div>

                        <div className="flex gap-3">

                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                                3
                            </div>

                            <div>
                                <p className="text-sm font-medium">
                                    Recovery execution
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                    Execute the bounded recovery action and record the outcome.
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="mt-7 border-t border-white/10 pt-5">

                        <p className="text-xs uppercase tracking-wider text-slate-500">
                            Agent Status
                        </p>

                        <div className="mt-3 flex items-center justify-between">

              <span className="text-sm text-slate-300">
                Gemini
              </span>

                            <span className="text-sm font-medium text-emerald-400">
                ● Active
              </span>

                        </div>

                        <div className="mt-3 flex items-center justify-between">

              <span className="text-sm text-slate-300">
                Policy Engine
              </span>

                            <span className="text-sm font-medium text-emerald-400">
                ● Enforced
              </span>

                        </div>

                    </div>

                </div>

            </div>

            {batchResult && (

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-6 py-5">

                        <h2 className="font-semibold text-slate-900">
                            Latest Batch Result
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Results from the most recent automated recovery batch.
                        </p>

                    </div>

                    <div className="grid grid-cols-6 gap-4 p-6">

                        <div className="rounded-xl bg-slate-50 p-4">
                            <RefreshCcw
                                size={18}
                                className="text-slate-500"
                            />

                            <p className="mt-3 text-xs text-slate-500">
                                Processed
                            </p>

                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {
                                    batchResult.processedCases
                                }
                            </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-4">
                            <CheckCircle2
                                size={18}
                                className="text-emerald-600"
                            />

                            <p className="mt-3 text-xs text-emerald-700">
                                Recovered
                            </p>

                            <p className="mt-1 text-xl font-semibold text-emerald-900">
                                {
                                    batchResult.recoveredCases
                                }
                            </p>
                        </div>

                        <div className="rounded-xl bg-red-50 p-4">
                            <XCircle
                                size={18}
                                className="text-red-600"
                            />

                            <p className="mt-3 text-xs text-red-700">
                                Failed
                            </p>

                            <p className="mt-1 text-xl font-semibold text-red-900">
                                {
                                    batchResult.failedCases
                                }
                            </p>
                        </div>

                        <div className="rounded-xl bg-blue-50 p-4">
                            <UserCheck
                                size={18}
                                className="text-blue-600"
                            />

                            <p className="mt-3 text-xs text-blue-700">
                                Human Review
                            </p>

                            <p className="mt-1 text-xl font-semibold text-blue-900">
                                {
                                    batchResult.humanReviewCases
                                }
                            </p>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-4">
                            <ShieldAlert
                                size={18}
                                className="text-amber-600"
                            />

                            <p className="mt-3 text-xs text-amber-700">
                                Blocked
                            </p>

                            <p className="mt-1 text-xl font-semibold text-amber-900">
                                {
                                    batchResult.blockedCases
                                }
                            </p>
                        </div>

                        <div className="rounded-xl bg-indigo-50 p-4">
                            <TrendingUp
                                size={18}
                                className="text-indigo-600"
                            />

                            <p className="mt-3 text-xs text-indigo-700">
                                Batch Rate
                            </p>

                            <p className="mt-1 text-xl font-semibold text-indigo-900">
                                {Number(
                                    batchResult.recoveryRate ??
                                    0
                                ).toFixed(1)}
                                %
                            </p>
                        </div>

                    </div>

                    <div className="border-t border-slate-100 px-6 py-5">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-xs uppercase tracking-wider text-slate-400">
                                    Batch Revenue at Risk
                                </p>

                                <p className="mt-1 text-xl font-semibold text-slate-900">
                                    {money(
                                        batchResult
                                            .totalRevenueAtRisk
                                    )}
                                </p>

                            </div>

                            <div className="text-right">

                                <p className="text-xs uppercase tracking-wider text-slate-400">
                                    Batch Revenue Recovered
                                </p>

                                <p className="mt-1 text-xl font-semibold text-emerald-600">
                                    {money(
                                        batchResult
                                            .totalRevenueRecovered
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            )}
            <ConfirmModal
                open={batchModalOpen}
                title="Run batch recovery?"
                description={`This will process ${openCases.length} currently open revenue-risk cases through Gemini, policy validation, and bounded workflow execution.`}
                confirmText="Run Batch"
                loading={running}
                onCancel={() =>
                    setBatchModalOpen(false)
                }
                onConfirm={async () => {
                    await handleBatchRecovery();
                    setBatchModalOpen(false);
                }}
            />

        </div>
    );
}
