import { useState } from "react";
import {
    useNavigate,
} from "react-router-dom";

import {
    Sparkles,
    Mail,
    Lock,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    login,
} from "../api/api";

import {
    useAuth,
} from "../context/AuthContext";

export default function Login() {

    const navigate =
        useNavigate();

    const {
        saveLogin,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    async function handleSubmit(event) {

        event.preventDefault();

        setLoading(true);

        try {

            const response =
                await login({
                    email,
                    password,
                });

            saveLogin(
                response.data
            );

            toast.success(
                "Welcome to RevenueAI"
            );

            navigate("/");

        } catch (error) {

            console.error(error);

            toast.error(
                "Invalid email or password"
            );

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-2">

            {/* LEFT SIDE */}

            <div className="hidden bg-[#0c111d] p-12 text-white lg:flex lg:flex-col lg:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500">

                        <Sparkles size={21} />

                    </div>

                    <div>

                        <h1 className="font-semibold">
                            RevenueAI
                        </h1>

                        <p className="text-xs text-slate-400">
                            Recovery Intelligence
                        </p>

                    </div>

                </div>

                <div className="max-w-lg">

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs text-indigo-300">

                        <Sparkles size={13} />

                        AI-powered revenue recovery

                    </div>

                    <h2 className="text-5xl font-semibold leading-tight tracking-tight">

                        Find revenue that's
                        <span className="text-indigo-400">
              {" "}slipping away.
            </span>

                    </h2>

                    <p className="mt-6 max-w-md text-base leading-7 text-slate-400">

                        Detect revenue at risk, determine the right intervention and execute bounded recovery workflows.

                    </p>

                    <div className="mt-10 space-y-4">

                        <div className="flex items-center gap-3 text-sm text-slate-300">

                            <ShieldCheck
                                size={18}
                                className="text-emerald-400"
                            />

                            Policy-controlled AI decisions

                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-300">

                            <ShieldCheck
                                size={18}
                                className="text-emerald-400"
                            />

                            Human-in-the-loop escalation

                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-300">

                            <ShieldCheck
                                size={18}
                                className="text-emerald-400"
                            />

                            Complete recovery audit trail

                        </div>

                    </div>

                </div>

                <p className="text-xs text-slate-600">
                    Revenue Recovery Intelligence Platform
                </p>

            </div>


            {/* LOGIN */}

            <div className="flex items-center justify-center bg-[#f7f8fa] p-6">

                <div className="w-full max-w-md">

                    <div className="mb-9 lg:hidden">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white">

                                <Sparkles size={19} />

                            </div>

                            <span className="font-semibold text-slate-900">
                RevenueAI
              </span>

                        </div>

                    </div>

                    <p className="text-sm font-medium text-indigo-600">
                        Welcome back
                    </p>

                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                        Sign in to RevenueAI
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Access your revenue recovery workspace.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                    >

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email address
                            </label>

                            <div className="relative">

                                <Mail
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="admin@revenueai.com"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                />

                            </div>

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign in"}

                            {!loading && (
                                <ArrowRight
                                    size={16}
                                />
                            )}

                        </button>

                    </form>

                    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">

                        <p className="text-xs leading-5 text-slate-500">

                            Revenue recovery actions are protected by role-based access controls and recorded in the audit trail.

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}