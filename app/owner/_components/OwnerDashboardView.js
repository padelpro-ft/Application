'use client';
import { Stat } from '@/app/_components/ui';

export default function OwnerDashboardView({ club, stats }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950 mb-1">{club.name}</h2>
      <p className="text-xs text-slate-500 mb-4">Vue d'ensemble</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Réservations aujourd'hui" value={stats.todayCount} />
        <Stat label="Réservations cette semaine" value={stats.weekCount} />
        <Stat label="Terrains disponibles" value={stats.availableCourts} tone="good" />
        <Stat label="Terrains occupés (auj.)" value={stats.occupiedToday} />
        <Stat label="CA théorique (7j)" value={`${stats.weekRevenue} €`} />
        <Stat label="En attente de paiement" value={stats.pendingPayment} tone="warn" />
        <Stat label="Réservations payées" value={stats.paidCount} tone="good" />
        <Stat label="Total terrains" value={club.courts.length} />
      </div>
    </div>
  );
}
