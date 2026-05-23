import "./globals.css";

export const metadata = {
    title: "MVP LevelUp",
    description: "Gamifie ta productivité",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body className="bg-slate-950 text-white">{children}</body>
        </html>
    );
}
