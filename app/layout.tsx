import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SwiftVote - Real-time Polling App",
    description: "Create and participate in real-time polls with instant results visualization",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
