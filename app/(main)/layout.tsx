import Providers from "@/app/(main)/providers";
import { Toaster } from "@/components/ui/toaster";
import { Component as EtheralShadow } from "@/components/ui/etheral-shadow";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="relative flex min-h-full flex-col">
        {/* Enhanced Background */}
        <div className="fixed inset-0 -z-10">
          <EtheralShadow
            color="rgba(64, 64, 64, 0.8)"
            animation={{ scale: 50, speed: 60 }}
            noise={{ opacity: 0.3, scale: 1.5 }}
            sizing="fill"
          />
          
          {/* Floating gradient orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-float-delay" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl animate-float" />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 flex min-h-full flex-col">
          {children}
        </div>

        <Toaster />
      </div>
    </Providers>
  );
}
