import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "../shared/components/Sidebar";
import TopBar from "../shared/components/TopBar";
import MobileBottomNav from "@/shared/components/MobileBottomNav";
import Providers from "./providers";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Lumen | Photography Hub",
  description:
    "A photography-first platform for sharing, learning, and showcasing portfolios.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-[#07080c] text-zinc-100`}
      >
        <Providers>
          <div className="min-h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              {/* <TopBar /> */}
              <main className="flex-1 px-6 py-6">{children}</main>
            </div>
          </div>
          <MobileBottomNav />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
