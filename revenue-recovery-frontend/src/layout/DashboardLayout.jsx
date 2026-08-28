import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-[#f7f8fa]">

            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="lg:ml-64">

                <Header />

                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}