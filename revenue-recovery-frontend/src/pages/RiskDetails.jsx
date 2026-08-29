import {
    useEffect,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Brain,
    ShieldCheck,
    Sparkles,
    Play,
    CheckCircle2,
    Clock3,
    AlertTriangle,
    IndianRupee,
} from "lucide-react";

import {
    analyzeRisk,
    getAuditLogs,
    getRevenueRisk,
    runRecoveryWorkflow,
} from "../api/api";

import StatusBadge from "../components/StatusBadge";
import toast from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value ?? 0);
}

export default function RiskDetails() {

    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [risk, setRisk] =
        useState(null);

    const [analysis, setAnalysis] =
        useState(null);

    const [auditLogs, setAuditLogs] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [analyzing, setAnalyzing] =
        useState(false);

    const [running, setRunning] =
        useState(false);

    const [workflowResult, setWorkflowResult] =
        useState(null);

    const [error, setError] =
        useState("");

    const [
        recoveryModalOpen,
        setRecoveryModalOpen,
    ] = useState(false);

    async function loadPage() {

        try {

            const [
                riskResponse,
                auditResponse,
            ] = await Promise.all([
                getRevenueRisk(id),
                getAuditLogs(id),
            ]);

            setRisk(
                riskResponse.data
            );

            setAuditLogs(
                Array.isArray(auditResponse.data)
                    ? auditResponse.data
                    : []
            );

        } catch (err) {

            console.error(err);

            setError(
                "Could not load this revenue-risk case."
            );

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        loadPage();
    }, [id]);

    async function handleAnalyze() {

        setAnalyzing(true);
        setError("");

        try {

            const response =
                await analyzeRisk(id);

            setAnalysis(
                response.data
            );

        } catch (err) {

            console.error(err);

            setError(
                "Gemini could not analyze this case."
            );

        } finally {

            setAnalyzing(false);

        }
    }

    async function handleRecovery() {

        setRunning(true);
        setError("");

        try {

            const response =
                await runRecoveryWorkflow(
                    id
                );

            setWorkflowResult(
                response.data
            );
            toast.error("Batch recovery success");

            await loadPage();

        } catch (err) {

            console.error(err);

            setError(
                "Recovery workflow failed."
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

    if (!risk) {

        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                Revenue risk not found.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1400px]">

            <button
                onClick={() =>
                    navigate("/risks")
                }
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
                <ArrowLeft size={16} />
                Back to revenue risks
            </button>

            <div className="mb-8 flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-indigo-600">
                        Revenue Risk #{risk.id}
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                        {risk.reason?.replaceAll(
                            "_",
                            " "
                        )}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        AI-assisted revenue recovery case
                    </p>

                </div>

                <StatusBadge
                    status={risk.status}
                />

            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <div className="xl:col-span-2 space-y-6">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="mb-6 font-semibold text-slate-900">
                            Revenue Risk
                        </h2>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                            <div>

                                <p className="text-xs uppercase tracking-wider text-slate-400">
                                    Amount at Risk
                                </p>

                                <div className="mt-2 flex items-center gap-2">

                                    <IndianRupee
                                        size={18}
                                        className="text-indigo-500"
                                    />

                                    <p className="text-xl font-semibold text-slate-900">
                                        {money(
                                            risk.amountAtRisk
                                        )}
                                    </p>

                                </div>

                            </div>

                            <div>

                                <p className="text-xs uppercase tracking-wider text-slate-400">
                                    Risk Score
                                </p>

                                <p className="mt-2 text-xl font-semibold text-slate-900">
                                    {Number(
                                        risk.riskScore ?? 0
                                    ).toFixed(2)}
                                </p>

                            </div>

                            <div>

                                <p className="text-xs uppercase tracking-wider text-slate-400">
                                    Failure Reason
                                </p>

                                <p className="mt-2 text-sm font-medium text-slate-900">
                                    {risk.reason?.replaceAll(
                                        "_",
                                        " "
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-white px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">
                                    <Sparkles size={18} />
                                </div>

                                <div>

                                    <h2 className="font-semibold text-slate-900">
                                        Gemini Analysis
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        AI recovery recommendation
                                    </p>

                                </div>

                            </div>

                            <button
                                onClick={
                                    handleAnalyze
                                }
                                disabled={analyzing}
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {analyzing
                                    ? "Analyzing..."
                                    : "Analyze with AI"}
                            </button>

                        </div>

                        <div className="p-6">

                            {!analysis ? (

                                <div className="py-8 text-center">

                                    <Brain
                                        size={32}
                                        className="mx-auto text-slate-300"
                                    />

                                    <p className="mt-3 text-sm font-medium text-slate-600">
                                        No analysis generated yet
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Run Gemini analysis to determine the best recovery intervention.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-6">

                                    <div>

                                        <p className="text-xs uppercase tracking-wider text-slate-400">
                                            Diagnosis
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-slate-700">
                                            {analysis.diagnosis}
                                        </p>

                                    </div>

                                    <div className="grid grid-cols-2 gap-5">

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                                Recommended Action
                                            </p>

                                            <p className="mt-2 font-semibold text-indigo-700">
                                                {analysis.recommendedAction}
                                            </p>

                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs uppercase tracking-wider text-slate-400">
                                                Confidence
                                            </p>

                                            <p className="mt-2 font-semibold text-slate-900">
                                                {(
                                                    Number(
                                                        analysis.confidence ??
                                                        0
                                                    ) * 100
                                                ).toFixed(0)}
                                                %
                                            </p>

                                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                                                <div
                                                    className="h-full rounded-full bg-indigo-500"
                                                    style={{
                                                        width: `${Math.min(
                                                            Number(
                                                                analysis.confidence ??
                                                                0
                                                            ) * 100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    </div>

                                    <div>

                                        <p className="text-xs uppercase tracking-wider text-slate-400">
                                            Reasoning
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-slate-700">
                                            {analysis.reason}
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center gap-3">

                            <ShieldCheck
                                className="text-emerald-600"
                                size={20}
                            />

                            <div>

                                <h2 className="font-semibold text-slate-900">
                                    Policy Guardrails
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Deterministic safety layer
                                </p>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                            <div className="rounded-xl bg-emerald-50 p-4">

                                <CheckCircle2
                                    size={18}
                                    className="text-emerald-600"
                                />

                                <p className="mt-3 text-xs text-emerald-700">
                                    Retry Limits
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-900">
                                    Enforced
                                </p>

                            </div>

                            <div className="rounded-xl bg-emerald-50 p-4">

                                <ShieldCheck
                                    size={18}
                                    className="text-emerald-600"
                                />

                                <p className="mt-3 text-xs text-emerald-700">
                                    Fraud Protection
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-900">
                                    Active
                                </p>

                            </div>

                            <div className="rounded-xl bg-emerald-50 p-4">

                                <Clock3
                                    size={18}
                                    className="text-emerald-600"
                                />

                                <p className="mt-3 text-xs text-emerald-700">
                                    Stopping Rules
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-900">
                                    Active
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="space-y-6">

                    <div className="rounded-2xl bg-[#111827] p-6 text-white shadow-sm">

                        <p className="text-sm text-slate-400">
                            Recovery Workflow
                        </p>

                        <h2 className="mt-1 text-xl font-semibold">
                            Run Recovery
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-slate-400">
                            Gemini recommends an intervention. The policy engine validates it before execution.
                        </p>

                        <button>
                            onClick={() =>
                            setRecoveryModalOpen(true)
                        }
                            disabled={
                                running ||
                                risk.status ===
                                "RECOVERED"
                            }
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"

                            <Play size={16} />

                            {running
                                ? "Running..."
                                : "Run Recovery Workflow"}
                        </button>

                        {workflowResult && (

                            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">

                                <p className="text-xs uppercase tracking-wider text-slate-500">
                                    Result
                                </p>

                                <p className="mt-2 font-semibold">
                                    {
                                        workflowResult.workflowStatus
                                    }
                                </p>

                                <p className="mt-2 text-sm leading-5 text-slate-400">
                                    {
                                        workflowResult.message
                                    }
                                </p>

                            </div>

                        )}

                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="font-semibold text-slate-900">
                            Audit Timeline
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            System and AI activity
                        </p>

                        <div className="mt-6 space-y-5">

                            {auditLogs.length === 0 && (

                                <p className="text-sm text-slate-400">
                                    No audit events yet.
                                </p>

                            )}

                            {auditLogs.map(
                                (log, index) => (

                                    <div
                                        key={log.id}
                                        className="relative flex gap-3"
                                    >

                                        {index !==
                                            auditLogs.length -
                                            1 && (
                                                <div className="absolute left-[7px] top-5 h-full w-px bg-slate-200" />
                                            )}

                                        <div className="relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-white bg-indigo-500 ring-1 ring-slate-200" />

                                        <div className="pb-3">

                                            <p className="text-sm font-medium text-slate-700">
                                                {log.eventType?.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {log.message}
                                            </p>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>

            <ConfirmModal
                open={recoveryModalOpen}
                title="Run recovery workflow?"
                description="Gemini will analyze this revenue risk, the policy engine will validate the recommendation, and an approved recovery action may be executed."
                confirmText="Run Recovery"
                loading={running}
                onCancel={() =>
                    setRecoveryModalOpen(false)
                }
                onConfirm={async () => {
                    await handleRecovery();
                    setRecoveryModalOpen(false);
                }}
            />

        </div>
    );
}
