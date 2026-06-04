import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen w-full flex-col bg-white text-slate-900 transition-colors duration-300 md:flex-row dark:bg-zinc-950 dark:text-slate-100">
            {/* EN-TÊTE MOBILE */}
            <div className="md:hidden pt-safe">
                <MobileHeader />
            </div>

            <Sidebar />

            {/* CONTENU PRINCIPAL */}
            <div className="flex flex-1 overflow-hidden pb-20 md:pb-0">
                {children}
            </div>

            {/* NAVIGATION BASSE MOBILE */}
            <div className="md:hidden pb-safe">
                <BottomNav />
            </div>
        </div>
    );
}
