import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardList, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const STATUS_LABELS: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_peca: "Aguardando peça",
  pronta: "Pronta",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

function DashboardHome() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [customers, orders, openOrders, deliveredOrders] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("service_orders").select("*", { count: "exact", head: true }),
        supabase.from("service_orders").select("*", { count: "exact", head: true }).in("status", ["aberta", "em_andamento", "aguardando_peca"]),
        supabase.from("service_orders").select("*", { count: "exact", head: true }).eq("status", "entregue"),
      ]);
      return {
        customers: customers.count ?? 0,
        orders: orders.count ?? 0,
        open: openOrders.count ?? 0,
        delivered: deliveredOrders.count ?? 0,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_orders")
        .select("id, order_number, equipment, status, created_at, customers(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Clientes", value: stats?.customers ?? 0, icon: Users, color: "from-blue-500 to-blue-700" },
    { label: "Total de OS", value: stats?.orders ?? 0, icon: ClipboardList, color: "from-purple-500 to-purple-700" },
    { label: "Em aberto", value: stats?.open ?? 0, icon: Wrench, color: "from-orange-500 to-orange-700" },
    { label: "Entregues", value: stats?.delivered ?? 0, icon: CheckCircle2, color: "from-green-500 to-green-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Visão Geral</h1>
        <p className="text-muted-foreground">Resumo da sua assistência técnica.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-3xl font-bold">{c.value}</div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Ordens recentes</h2>
          <Link to="/dashboard/ordens" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recent && recent.length > 0 ? (
          <div className="divide-y divide-border">
            {recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">#{o.order_number} — {o.equipment}</div>
                  <div className="text-sm text-muted-foreground">
                    {(o.customers as { name: string } | null)?.name ?? "—"}
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  {STATUS_LABELS[o.status]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma ordem cadastrada ainda. <Link to="/dashboard/ordens" className="text-primary hover:underline">Criar primeira OS</Link>
          </p>
        )}
      </div>
    </div>
  );
}
