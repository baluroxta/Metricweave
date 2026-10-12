import Link from "next/link";
import { BarChart3, ShieldCheck, FileSpreadsheet, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <BarChart3 className="size-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">
                MetricWeave <span className="text-blue-500">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              From raw data to clear decisions. An enterprise-grade analytics engine that transforms CSV and Excel datasets into interactive business dashboards and genuine Microsoft Power BI Desktop projects.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Cpu className="size-3.5" /> Deterministic & AI-Ready
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <FileSpreadsheet className="size-3.5" /> Native Power BI (.pbip)
              </span>
            </div>
          </div>

          {/* Business Templates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Business Templates</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/create?template=sales" className="hover:text-foreground transition-colors">Sales & Commerce</Link></li>
              <li><Link href="/create?template=finance" className="hover:text-foreground transition-colors">Financial Health & P&L</Link></li>
              <li><Link href="/create?template=hr" className="hover:text-foreground transition-colors">Workforce & Talent</Link></li>
              <li><Link href="/create?template=marketing" className="hover:text-foreground transition-colors">Campaign Acquisition</Link></li>
              <li><Link href="/create?template=executive" className="hover:text-foreground transition-colors">Executive Overview</Link></li>
            </ul>
          </div>

          {/* Power BI & Open Source */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Platform & Open Source</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/create" className="hover:text-foreground transition-colors">Upload Dataset</Link></li>
              <li><Link href="#power-bi" className="hover:text-foreground transition-colors">Power BI PBIP Architecture</Link></li>
              <li><Link href="#developer" className="hover:text-foreground transition-colors">Developer</Link></li>
              <li><span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-medium"><ShieldCheck className="size-3.5" /> Privacy First (Zero Data Leaks)</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            MetricWeave AI © 2026 | Developed by Kandala Guru Balaji
          </p>
          <p className="text-muted-foreground text-center sm:text-right">
            Designed for high-accuracy analytics and Microsoft Power BI Desktop integration.
          </p>
        </div>
      </div>
    </footer>
  );
}
