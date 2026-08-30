import { useEffect, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    UserCheck,
    IndianRupee,
    ExternalLink,
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
    const [processingId, setProcessingId] = useState(null);

    const [selectedReview, setSelectedReview] = useState(null);
    const [decision, setDecision] = useState(null);

    async function loadReviews() {
        try {
            const response = await getHumanReviews();
            setReviews(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Unable to load human review queue");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReviews();
    }, []);

    async function handleDecision() {
        if (!selectedReview || !decision) {
            return;
        }

        setProcessingId(selectedReview.id);

        try {
            if (decision === "APPROVE") {
                await approveHumanReview(selectedReview.id);
                toast.success(`Risk #${selectedReview.id} approved`);
            } else {
                await rejectHumanReview(selectedReview.id);
                toast.success(`Risk #${selectedReview.id} rejected`);
            }

            await loadReviews();

            setSelectedReview(null);
            setDecision(null);
        } catch (error) {
            console.error(error);
            toast.error("Unable to process review");
        } finally {
            setProcessingId(null);
        }
    }

    const totalRevenue = reviews.reduce(
        (sum, risk) => sum + Number(risk.amountAtRisk || 0),
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

            <div>
                <p className="text-sm font-medium text-indigo-600">
                    Human-in-the-loop
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                    Human Review
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Review cases where automated recovery has been
                    paused by policy controls.
                </p>
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
                    value={`₹${totalRevenue.toLocaleString("en-IN")}`}
                />

                <SummaryCard
                    icon={<ShieldCheck size={19} />}
                    title="Automation Policy"
                    value="Protected"
                />

            </div>

            {/* QUEUE */}

            <div className="rounded-2xl border border-slate-200 bg-white">

                <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="font-semibold text-slate-900">
                        Review Queue
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {reviews.length} case{reviews.length !== 1 ? "s" : ""} waiting
                        for a reviewer.
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
                        {risk.failureReason || "UNKNOWN"}
                      </span>

                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">

                                            <RiskInfo
                                                label="Revenue at Risk"
                                                value={`₹${Number(
                                                    risk.amountAtRisk || 0
                                                ).toLocaleString("en-IN")}`}
                                            />

                                            <RiskInfo
                                                label="Risk Score"
                                                value={
                                                    risk.riskScore != null
                                                        ? `${Math.round(
                                                            Number(risk.riskScore) * 100
                                                        )}%`
                                                        : "—"
                                                }
                                            />

                                            <RiskInfo
                                                label="Status"
                                                value={risk.status || "—"}
                                            />

                                            <RiskInfo
                                                label="Review Status"
                                                value={risk.reviewStatus || "PENDING"}
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
                                                    Automated recovery was paused because this
                                                    case requires manual authorization under the
                                                    recovery policy.
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
                                            onClick={() => {
                                                setSelectedReview(risk);
                                                setDecision("APPROVE");
                                            }}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                                        >
                                            <CheckCircle2 size={16} />
                                            Approve
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedReview(risk);
                                                setDecision("REJECT");
                                            }}
                                            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
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

            <ConfirmModal
                open={Boolean(selectedReview)}
                title={
                    decision === "APPROVE"
                        ? "Approve recovery?"
                        : "Reject recovery?"
                }
                description={
                    decision === "APPROVE"
                        ? `Risk #${selectedReview?.id} will be approved for recovery processing.`
                        : `Risk #${selectedReview?.id} will be rejected and automated recovery will remain stopped.`
                }
                confirmText={
                    decision === "APPROVE"
                        ? "Approve"
                        : "Reject"
                }
                danger={decision === "REJECT"}
                loading={processingId !== null}
                onCancel={() => {
                    setSelectedReview(null);
                    setDecision(null);
                }}
                onConfirm={handleDecision}
            />

        </div>
    );
}

function SummaryCard({ icon, title, value }) {
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

function RiskInfo({ label, value }) {
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