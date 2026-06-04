import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
    title: "Progressi",
    description: "...",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
