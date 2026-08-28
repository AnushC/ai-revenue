import { useEffect, useState } from "react";
import {
    ShieldAlert,
    UserCheck,
    IndianRupee,
    Brain,
} from "lucide-react";

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

export default function HumanReview() {
    const [cases, setCases] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        async function loadCases() {

            try {

                const response =
                    await getRevenueRisks();

                const risks =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                const reviewCases =
                    risks.filter(
                        (risk) =>
                            risk.reason ===
                            "FRAUD_SUSPECTED" ||
                            risk.reason ===
                            "UNKNOWN"
                    );

                setCases(
                    reviewCases
                );

            } catch (err) {

                console.error(err);

                setError(
                    "Could not load human-review cases."
                );

            } finally {

                setLoading(false);

            }
        }

        loadCases();

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

            <div className="mb-8">

                <p className="mb-1 text-sm font-medium text-indigo-600">
                    Controlled Escalation
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Human Review
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Sensitive cases requiring manual review rather than autonomous recovery.
                </p>

            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                <div className="flex gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <ShieldAlert size={20} />
                    </div>

                    <div>

                        <p className="font-medium text-amber-900">
                            Human-in-the-loop guardrail
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-800">
                            Fraud and ambiguous payment failures are escalated instead of being automatically retried.
                        </p>

                    </div>

                </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <UserCheck
                        size={20}
                        className="text-indigo-500"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Review Queue
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {cases.length}
                    </p>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <IndianRupee
                        size={20}
                        className="text-indigo-500"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Revenue Awaiting Review
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {money(
                            cases.reduce(
                                (total, item) =>
                                    total +
                                    Number(
                                        item.amountAtRisk ??
                                        0
                                    ),
                                0
                            )
                        )}
                    </p>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <Brain
                        size={20}
                        className="text-indigo-500"
                    />

                    <p className="mt-4 text-sm text-slate-500">
                        Automation Policy
                    </p>

                    <p className="mt-1 text-lg font-semibold text-emerald-600">
                        Protected
                    </p>

                </div>

            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-6 py-5">

                    <h2 className="font-semibold text-slate-900">
                        Escalated Cases
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Cases requiring investigation before further recovery activity.
                    </p>

                </div>

                <div className="divide-y divide-slate-100">

                    {cases.length === 0 && (

                        <div className="py-16 text-center">

                            <UserCheck
                                size={34}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-700">
                                No cases require review
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Sensitive risks will appear here automatically.
                            </p>

                        </div>

                    )}

                    {cases.map(
                        (risk) => (

                            <div
                                key={risk.id}
                                className="flex items-center justify-between px-6 py-5"
                            >

                                <div className="flex items-center gap-4">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                        <ShieldAlert size={18} />
                                    </div>

                                    <div>

                                        <p className="text-sm font-medium text-slate-900">
                                            Revenue Risk #{risk.id}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {risk.reason?.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </p>

                                    </div>

                                </div>

                                <div className="flex items-center gap-8">

                                    <div className="text-right">

                                        <p className="text-xs text-slate-400">
                                            Amount
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {money(
                                                risk.amountAtRisk
                                            )}
                                        </p>

                                    </div>

                                    <StatusBadge
                                        status={risk.status}
                                    />

                                    <Link
                                        to={`/risks/${risk.id}`}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        Review case
                                    </Link>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>

        </div>
    );
}
