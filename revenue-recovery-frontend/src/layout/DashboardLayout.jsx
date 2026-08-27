import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-[#f7f8fa]">

            <Sidebar />

            <div className="ml-64">

                <Header />

                <main className="p-8">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}