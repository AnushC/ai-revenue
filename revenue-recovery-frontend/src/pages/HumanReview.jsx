import { useEffect, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    UserCheck,
    IndianRupee,
    ExternalLink,
    RefreshCw,
} from "lucide-react";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
    getHumanReviews,
    approveHumanReview,
    rejectHumanReview,
} from "../api/api";

import ConfirmModal from "../components/ConfirmModal";

export default function HumanReview() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [processingId, setProcessingId] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [decision, setDecision] = useState(null);

    async function loadReviews(showRefreshIndicator = false) {
        if (showRefreshIndicator) {
            setRefreshing(true);
        }

        try {
            const response = await getHumanReviews();

            setReviews(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (error) {
            console.error(
                "Unable to load human review queue:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error;

            toast.error(
                backendMessage ||
                "Unable to load human review queue"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadReviews();
    }, []);

    async function handleDecision() {
        if (!selectedReview || !decision) {
            return;
        }

        const riskId = selectedReview.id;

        setProcessingId(riskId);

        try {
            if (decision === "APPROVE") {
                const response =
                    await approveHumanReview(riskId);

                const updatedRisk =
                    response.data;

                showApprovalResult(
                    riskId,
                    updatedRisk
                );
            } else {
                const response =
                    await rejectHumanReview(riskId);

                const updatedRisk =
                    response.data;

                const status =
                    updatedRisk?.status || "STOPPED";

                toast.success(
                    `Risk #${riskId} rejected — ${formatText(
                        status
                    )}`
                );
            }

            setSelectedReview(null);
            setDecision(null);

            await loadReviews();

        } catch (error) {
            console.error(
                "Human review error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error;

            toast.error(
                backendMessage ||
                `Unable to process review (${
                    error.response?.status ||
                    "unknown error"
                })`
            );
        } finally {
            setProcessingId(null);
        }
    }

    function showApprovalResult(
        riskId,
        updatedRisk
    ) {
        const status =
            updatedRisk?.status;

        if (status === "RECOVERED") {
            toast.success(
                `Risk #${riskId} approved and revenue recovered`
            );

            return;
        }

        if (status === "STOPPED") {
            toast.success(
                `Risk #${riskId} reviewed and recovery stopped`
            );

            return;
        }

        if (status === "OPEN") {
            toast(
                `Risk #${riskId} approved, but recovery attempt failed`
            );

            return;
        }

        if (status === "IN_RECOVERY") {
            toast.success(
                `Risk #${riskId} approved for recovery`
            );

            return;
        }

        toast.success(
            `Risk #${riskId} approved`
        );
    }

    const totalRevenue = reviews.reduce(
        (sum, risk) =>
            sum + Number(risk.amountAtRisk || 0),
        0
    );

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-slate-500">
                    Loading review queue...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-7">

            {/* HEADER */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

                <div>
                    <p className="text-sm font-medium text-indigo-600">
                        Human-in-the-loop
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                        Human Review
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Review cases where automated recovery has
                        been paused by policy controls.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={refreshing}
                    onClick={() =>
                        loadReviews(true)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {refreshing
                        ? "Refreshing..."
                        : "Refresh"}
                </button>

            </div>

            {/* POLICY BANNER */}

            <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                    <ShieldCheck size={20} />
                </div>

                <div>
                    <p className="font-medium text-amber-900">
                        Automation Guardrail Active
                    </p>

                    <p className="mt-1 text-sm leading-6 text-amber-700">
                        These cases require human authorization before
                        automated recovery can continue.
                    </p>
                </div>

            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <SummaryCard
                    icon={<UserCheck size={19} />}
                    title="Awaiting Review"
                    value={reviews.length}
                />

                <SummaryCard
                    icon={<IndianRupee size={19} />}
                    title="Revenue Awaiting Decision"
                    value={`₹${totalRevenue.toLocaleString(
                        "en-IN"
                    )}`}
                />

                <SummaryCard
                    icon={<ShieldCheck size={19} />}
                    title="Automation Policy"
                    value="Protected"
                />

            </div>

            {/* REVIEW QUEUE */}

            <div className="rounded-2xl border border-slate-200 bg-white">

                <div className="border-b border-slate-100 px-6 py-5">

                    <h2 className="font-semibold text-slate-900">
                        Review Queue
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {reviews.length} case
                        {reviews.length !== 1 ? "s" : ""}
                        {" "}waiting for a reviewer.
                    </p>

                </div>

                {reviews.length === 0 ? (

                    <div className="px-6 py-16 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={22} />
                        </div>

                        <h3 className="mt-4 font-medium text-slate-900">
                            Review queue is clear
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            There are currently no revenue risks requiring
                            human intervention.
                        </p>

                    </div>

                ) : (

                    <div className="divide-y divide-slate-100">

                        {reviews.map((risk) => (

                            <div
                                key={risk.id}
                                className="p-6 transition hover:bg-slate-50/60"
                            >

                                <div className="flex flex-col justify-between gap-5 xl:flex-row">

                                    <div className="flex-1">

                                        <div className="flex flex-wrap items-center gap-3">

                                            <span className="text-sm font-semibold text-slate-900">
                                                Risk #{risk.id}
                                            </span>

                                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                                                HUMAN REVIEW
                                            </span>

                                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                {formatText(
                                                    risk.reason || "UNKNOWN"
                                                )}
                                            </span>

                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">

                                            <RiskInfo
                                                label="Revenue at Risk"
                                                value={`₹${Number(
                                                    risk.amountAtRisk || 0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}`}
                                            />

                                            <RiskInfo
                                                label="Risk Score"
                                                value={
                                                    risk.riskScore != null
                                                        ? `${Math.round(
                                                            Number(
                                                                risk.riskScore
                                                            ) * 100
                                                        )}%`
                                                        : "—"
                                                }
                                            />

                                            <RiskInfo
                                                label="Status"
                                                value={formatText(
                                                    risk.status || "—"
                                                )}
                                            />

                                            <RiskInfo
                                                label="Review Status"
                                                value={formatText(
                                                    risk.reviewStatus ||
                                                    "PENDING"
                                                )}
                                            />

                                        </div>

                                        <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">

                                            <AlertTriangle
                                                size={18}
                                                className="mt-0.5 shrink-0 text-amber-600"
                                            />

                                            <div>

                                                <p className="text-sm font-medium text-slate-800">
                                                    Why human review?
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                    {getReviewReason(
                                                        risk
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    {/* ACTIONS */}

                                    <div className="flex shrink-0 flex-row items-center gap-2 xl:flex-col xl:items-stretch">

                                        <Link
                                            to={`/risks/${risk.id}`}
                                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Details
                                            <ExternalLink size={14} />
                                        </Link>

                                        <button
                                            type="button"
                                            disabled={
                                                processingId !== null
                                            }
                                            onClick={() => {
                                                setSelectedReview(
                                                    risk
                                                );

                                                setDecision(
                                                    "APPROVE"
                                                );
                                            }}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <CheckCircle2 size={16} />

                                            Approve
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                processingId !== null
                                            }
                                            onClick={() => {
                                                setSelectedReview(
                                                    risk
                                                );

                                                setDecision(
                                                    "REJECT"
                                                );
                                            }}
                                            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <XCircle size={16} />

                                            Reject
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {/* CONFIRM MODAL */}

            <ConfirmModal
                open={Boolean(selectedReview)}
                title={
                    decision === "APPROVE"
                        ? "Approve recovery?"
                        : "Reject recovery?"
                }
                description={
                    decision === "APPROVE"
                        ? `Risk #${selectedReview?.id} will be approved and the authorized recovery action will continue.`
                        : `Risk #${selectedReview?.id} will be rejected and automated recovery will be stopped.`
                }
                confirmText={
                    decision === "APPROVE"
                        ? "Approve"
                        : "Reject"
                }
                danger={
                    decision === "REJECT"
                }
                loading={
                    processingId !== null
                }
                onCancel={() => {
                    if (processingId !== null) {
                        return;
                    }

                    setSelectedReview(null);
                    setDecision(null);
                }}
                onConfirm={handleDecision}
            />

        </div>
    );
}

function SummaryCard({
                         icon,
                         title,
                         value,
                     }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                {icon}
            </div>

            <p className="mt-4 text-sm text-slate-500">
                {title}
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-900">
                {value}
            </p>

        </div>
    );
}

function RiskInfo({
                      label,
                      value,
                  }) {
    return (
        <div>

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium text-slate-800">
                {value}
            </p>

        </div>
    );
}

function formatText(value) {
    if (!value) {
        return "—";
    }

    return String(value)
        .replaceAll("_", " ");
}

function getReviewReason(risk) {
    switch (risk?.reason) {

        case "FRAUD_SUSPECTED":
            return (
                "Possible fraud was detected. Automated recovery "
                + "was paused so a human reviewer can evaluate "
                + "the case before any further action."
            );

        case "UNKNOWN":
            return (
                "The payment failure reason could not be determined "
                + "with enough certainty, so manual authorization is required."
            );

        case "BANK_DECLINED":
            return (
                "The payment was declined by the customer's bank. "
                + "Manual authorization is required before recovery continues."
            );

        case "EXPIRED_CARD":
            return (
                "The saved payment method may have expired. "
                + "A reviewer can authorize a safer recovery action."
            );

        case "INSUFFICIENT_FUNDS":
            return (
                "The payment may have failed because insufficient funds "
                + "were available. Human review can authorize a delayed retry."
            );

        case "AUTHENTICATION_REQUIRED":
            return (
                "Additional customer authentication is required "
                + "before the payment can be attempted again."
            );

        default:
            return (
                "Automated recovery was paused because this case "
                + "requires manual authorization under the recovery policy."
            );
    }
}