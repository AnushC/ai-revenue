import { X, TriangleAlert } from "lucide-react";

export default function ConfirmModal({
                                         open,
                                         title,
                                         description,
                                         confirmText = "Confirm",
                                         cancelText = "Cancel",
                                         danger = false,
                                         loading = false,
                                         onConfirm,
                                         onCancel,
                                     }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

                <div className="flex items-start justify-between">

                    <div className="flex gap-3">

                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                danger
                                    ? "bg-red-50 text-red-600"
                                    : "bg-indigo-50 text-indigo-600"
                            }`}
                        >
                            <TriangleAlert size={19} />
                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                {title}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {description}
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={onCancel}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="mt-6 flex justify-end gap-3">

                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${
                            danger
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                    >
                        {loading
                            ? "Processing..."
                            : confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
}