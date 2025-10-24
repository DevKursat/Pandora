import { Shield } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <Shield className="w-16 h-16 text-primary mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold text-center mb-4">Site Bakımda</h1>
      <p className="text-lg text-slate-400 text-center max-w-md">
        Sistemimizi iyileştirmek için kısa bir süreliğine bakım yapıyoruz. Anlayışınız için teşekkür ederiz. Lütfen daha sonra tekrar deneyin.
      </p>
    </div>
  );
}
