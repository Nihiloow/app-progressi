import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen w-full bg-white text-slate-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-slate-100">
            <Sidebar />
            {/*contenu de page.js*/}
            {children}
        </div>
    );
}
