import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata = {
    title: "MVP LevelUp",
    description: "Gamifie ta productivité",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
