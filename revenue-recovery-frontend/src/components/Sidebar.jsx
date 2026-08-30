import {
    LayoutDashboard,
    TriangleAlert,
    RefreshCcw,
    UserCheck,
    ScrollText,
    Sparkles,
    Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {

    const { user } = useAuth();

    const navigation = [
        {
            name: "Overview",
            path: "/",
            icon: LayoutDashboard,
            roles: [
                "ADMIN",
                "RECOVERY_ANALYST",
                "REVIEWER",
            ],
        },
        {
            name: "Revenue Risks",
            path: "/risks",
            icon: TriangleAlert,
            roles: [
                "ADMIN",
                "RECOVERY_ANALYST",
                "REVIEWER",
            ],
        },
        {
            name: "Recovery Center",
            path: "/recovery",
            icon: RefreshCcw,
            roles: [
                "ADMIN",
                "RECOVERY_ANALYST",
            ],
        },
        {
            name: "Human Review",
            path: "/human-review",
            icon: UserCheck,
            roles: [
                "ADMIN",
                "REVIEWER",
            ],
        },
        {
            name: "Audit Log",
            path: "/audit",
            icon: ScrollText,
            roles: [
                "ADMIN",
                "RECOVERY_ANALYST",
                "REVIEWER",
            ],
        },
    ];

    const visibleNavigation = navigation.filter(
        (item) => item.roles.includes(user?.role)
    );

    return (
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-[#0c111d] px-4 py-6 text-white">

            <div className="mb-10 flex items-center gap-3 px-2">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
                    <Sparkles size={20} />
                </div>

                <div>
                    <h1 className="font-semibold tracking-tight">
                        RevenueAI
                    </h1>

                    <p className="text-xs text-slate-400">
                        Recovery Intelligence
                    </p>
                </div>

            </div>

            <nav className="flex-1 space-y-1">

                {visibleNavigation.map((item) => {

                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all ${
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <Icon size={18} />

                            {item.name}
                        </NavLink>
                    );
                })}

            </nav>

            <div className="border-t border-white/10 pt-4">

                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
                    <Settings size={18} />
                    Settings
                </button>

            </div>

        </aside>
    );
}