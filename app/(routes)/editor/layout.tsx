import { Work_Sans } from "next/font/google";

import "@app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";


export const metadata = {
  title: "Griddy-Schemes - Collaborative Site Planner",
  description:
    "Planning and designing site. Collaborate with your team in real-time.",
};

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
});

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang='en'>
    <body className={`${workSans.className} bg-primary-grey-200`}>
      <TooltipProvider>{children}</TooltipProvider>
    </body>
  </html>
);


export default RootLayout;
