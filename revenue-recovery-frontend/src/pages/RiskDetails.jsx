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

function readableStatus(value) {
    return value?.replaceAll("_", " ") ?? "";
}

export default function RiskDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

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

            toast.success(
                "Gemini analysis completed"
            );

        } catch (err) {

            console.error(err);

            setError(
                "Gemini could not analyze this case."
            );

            toast.error(
                "Gemini analysis failed"
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

            toast.success(
                "Recovery workflow completed"
            );

            await loadPage();

        } catch (err) {

            console.error(err);

            setError(
                "Recovery workflow failed."
            );

            toast.error(
                "Recovery workflow failed"
            );

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

    const riskScore =
        Number(
            risk.riskScore ?? 0
        );

    const isTerminal =
        risk.status === "RECOVERED" ||
        risk.status === "STOPPED" ||
        risk.status === "LOST";

    return (
        <div className="mx-auto max-w-[1400px]">

            {/* Back button */}
            <button
                onClick={() =>
                    navigate("/risks")
                }
                className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                <ArrowLeft size={16} />
                Back to revenue risks
            </button>

            {/* Page header */}
            <div className="mb-8 flex items-start justify-between gap-6">

                <div>

                    <p className="text-sm font-medium text-indigo-600">
                        Revenue Risk #{risk.id}
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                        {readableStatus(
                            risk.reason
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

            {/* Error */}
            {error && (

                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

                    <p className="text-sm font-medium text-red-700">
                        {error}
                    </p>

                </div>

            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                {/* Main content */}
                <div className="space-y-6 xl:col-span-2">

                    {/* Revenue Risk Summary */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="mb-6 text-lg font-semibold text-slate-900">
                            Revenue Risk
                        </h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                            {/* Amount */}
                            <div className="border-b border-slate-100 pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-6">

                                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Amount at Risk
                                </p>

                                <div className="mt-3 flex items-center gap-2">

                                    <IndianRupee
                                        size={19}
                                        className="text-indigo-500"
                                    />

                                    <p className="text-2xl font-semibold tracking-tight text-slate-900">
                                        {money(
                                            risk.amountAtRisk
                                        )}
                                    </p>

                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Potential revenue impact
                                </p>

                            </div>

                            {/* Risk Score */}
                            <div className="border-b border-slate-100 pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-6">

                                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Risk Score
                                </p>

                                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                                    {riskScore.toFixed(2)}
                                </p>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className="h-full rounded-full bg-indigo-500"
                                        style={{
                                            width: `${Math.min(
                                                riskScore * 100,
                                                100
                                            )}%`,
                                        }}
                                    />

                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    Revenue recovery risk level
                                </p>

                            </div>

                            {/* Reason */}
                            <div>

                                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                    Failure Reason
                                </p>

                                <p className="mt-3 text-base font-semibold text-slate-900">
                                    {readableStatus(
                                        risk.reason
                                    )}
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Detected payment or billing failure
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Gemini Analysis */}
                    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">

                        <div className="flex flex-col gap-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                                    <Sparkles size={19} />
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
                                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {analyzing
                                    ? "Analyzing..."
                                    : "Analyze with AI"}
                            </button>

                        </div>

                        <div className="p-6">

                            {!analysis ? (

                                <div className="py-10 text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">

                                        <Brain
                                            size={30}
                                            className="text-indigo-300"
                                        />

                                    </div>

                                    <p className="mt-4 text-sm font-semibold text-slate-700">
                                        No analysis generated yet
                                    </p>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                        Run Gemini analysis to determine the most appropriate recovery intervention for this case.
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-6">

                                    {/* Diagnosis */}
                                    <div>

                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                            Diagnosis
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-slate-700">
                                            {analysis.diagnosis}
                                        </p>

                                    </div>

                                    {/* Recommendation */}
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">

                                            <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                                                Recommended Action
                                            </p>

                                            <p className="mt-2 font-semibold text-indigo-700">
                                                {readableStatus(
                                                    analysis.recommendedAction
                                                )}
                                            </p>

                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                                Confidence
                                            </p>

                                            <p className="mt-2 font-semibold text-slate-900">
                                                {(
                                                    Number(
                                                        analysis.confidence ?? 0
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
                                                                analysis.confidence ?? 0
                                                            ) * 100,
                                                            100
                                                        )}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>

                                    </div>

                                    {/* Reasoning */}
                                    <div>

                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
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

                    {/* Policy Guardrails */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">

                                <ShieldCheck
                                    className="text-emerald-600"
                                    size={20}
                                />

                            </div>

                            <div>

                                <h2 className="font-semibold text-slate-900">
                                    Policy Guardrails
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Deterministic safety layer for AI recovery decisions
                                </p>

                            </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            {/* Retry Limits */}
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">

                                <CheckCircle2
                                    size={19}
                                    className="text-emerald-600"
                                />

                                <p className="mt-3 text-xs font-medium text-emerald-700">
                                    Retry Limits
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-950">
                                    Enforced
                                </p>

                                <p className="mt-2 text-xs leading-5 text-emerald-700/70">
                                    Maximum recovery attempts are strictly controlled.
                                </p>

                            </div>

                            {/* Fraud */}
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">

                                <ShieldCheck
                                    size={19}
                                    className="text-emerald-600"
                                />

                                <p className="mt-3 text-xs font-medium text-emerald-700">
                                    Fraud Protection
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-950">
                                    Active
                                </p>

                                <p className="mt-2 text-xs leading-5 text-emerald-700/70">
                                    Suspicious cases are blocked or escalated to review.
                                </p>

                            </div>

                            {/* Stop Rules */}
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">

                                <Clock3
                                    size={19}
                                    className="text-emerald-600"
                                />

                                <p className="mt-3 text-xs font-medium text-emerald-700">
                                    Stopping Rules
                                </p>

                                <p className="mt-1 text-sm font-semibold text-emerald-950">
                                    Active
                                </p>

                                <p className="mt-2 text-xs leading-5 text-emerald-700/70">
                                    Recovered, stopped, and lost cases cannot continue.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* Right column */}
                <div className="space-y-6">

                    {/* Recovery Workflow */}
                    <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-sm">

                        {/* Header */}
                        <div className="border-b border-indigo-100 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                                    <Sparkles size={20} />
                                </div>

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                                        Recovery Workflow
                                    </p>

                                    <h2 className="mt-1 text-xl font-semibold text-slate-900">
                                        Run Recovery
                                    </h2>

                                </div>

                            </div>

                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                Gemini recommends an intervention, then the policy engine validates it before anything is executed.
                            </p>

                        </div>

                        {/* Steps */}
                        <div className="px-6 py-5">

                            <div className="space-y-1">

                                {/* 1 */}
                                <div className="flex gap-4 rounded-xl p-3 transition hover:bg-white/70">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                        1
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-slate-900">
                                            AI Recommendation
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Gemini analyzes the risk and recommends the best recovery action.
                                        </p>

                                    </div>

                                </div>

                                <div className="ml-[27px] h-3 w-px bg-indigo-200" />

                                {/* 2 */}
                                <div className="flex gap-4 rounded-xl p-3 transition hover:bg-white/70">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                        2
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-slate-900">
                                            Policy Validation
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Guardrails check confidence, fraud, attempt limits and high-value cases.
                                        </p>

                                    </div>

                                </div>

                                <div className="ml-[27px] h-3 w-px bg-indigo-200" />

                                {/* 3 */}
                                <div className="flex gap-4 rounded-xl p-3 transition hover:bg-white/70">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                        3
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-slate-900">
                                            Recovery Execution
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            Approved actions are executed. Sensitive cases are sent for human review.
                                        </p>

                                    </div>

                                </div>

                                <div className="ml-[27px] h-3 w-px bg-indigo-200" />

                                {/* 4 */}
                                <div className="flex gap-4 rounded-xl p-3 transition hover:bg-white/70">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                        4
                                    </div>

                                    <div>

                                        <p className="text-sm font-semibold text-slate-900">
                                            Outcome Tracking
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            The result is recorded and revenue analytics are updated.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* Workflow result */}
                            {workflowResult && (

                                <div
                                    className={`mt-5 rounded-xl border p-4 ${
                                        workflowResult.workflowStatus === "RECOVERED"
                                            ? "border-emerald-200 bg-emerald-50"
                                            : workflowResult.workflowStatus === "FAILED"
                                                ? "border-red-200 bg-red-50"
                                                : workflowResult.workflowStatus === "HUMAN_REVIEW"
                                                    ? "border-amber-200 bg-amber-50"
                                                    : "border-slate-200 bg-slate-50"
                                    }`}
                                >

                                    <div className="flex items-center gap-2">

                                        <CheckCircle2
                                            size={17}
                                            className={
                                                workflowResult.workflowStatus === "RECOVERED"
                                                    ? "text-emerald-600"
                                                    : workflowResult.workflowStatus === "FAILED"
                                                        ? "text-red-600"
                                                        : workflowResult.workflowStatus === "HUMAN_REVIEW"
                                                            ? "text-amber-600"
                                                            : "text-slate-500"
                                            }
                                        />

                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Workflow Result
                                        </p>

                                    </div>

                                    <p className="mt-2 font-semibold text-slate-900">
                                        {readableStatus(
                                            workflowResult.workflowStatus
                                        )}
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {workflowResult.message}
                                    </p>

                                </div>

                            )}

                            {/* Button */}
                            <button
                                onClick={() =>
                                    setRecoveryModalOpen(true)
                                }
                                disabled={
                                    running ||
                                    isTerminal
                                }
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                            >

                                <Play size={17} />

                                {running
                                    ? "Running Recovery..."
                                    : risk.status === "RECOVERED"
                                        ? "Revenue Already Recovered"
                                        : risk.status === "STOPPED"
                                            ? "Recovery Stopped"
                                            : risk.status === "LOST"
                                                ? "Revenue Marked Lost"
                                                : "Run Recovery Workflow"}

                            </button>

                            {/* Safety note */}
                            <div className="mt-3 flex items-start gap-2">

                                <ShieldCheck
                                    size={14}
                                    className="mt-0.5 shrink-0 text-emerald-600"
                                />

                                <p className="text-xs leading-5 text-slate-500">
                                    Every AI recommendation is checked by deterministic policy rules before execution.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Audit Timeline */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="font-semibold text-slate-900">
                            Audit Timeline
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            System and AI activity
                        </p>

                        <div className="mt-6 space-y-5">

                            {auditLogs.length === 0 && (

                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">

                                    <ScrollEmptyState />

                                </div>

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
                                                {readableStatus(
                                                    log.eventType
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

            {/* Confirm Modal */}
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

                    setRecoveryModalOpen(
                        false
                    );
                }}
            />

        </div>
    );
}

function ScrollEmptyState() {

    return (
        <>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
                <Clock3 size={18} />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-600">
                No audit events yet
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-400">
                Decisions, actions, and recovery outcomes will appear here.
            </p>
        </>
    );
}