import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import { subDays, format, startOfDay, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, CheckCircle2, Clock, TrendingUp, Wrench, DollarSign } from "lucide-react";

export const Route = createFileRoute("/dashboard/produtividade")({
  component: ProdutividadePage,
});

const STATUS_LABELS: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_peca: "Aguardando peça",
  pronta: "Pronta",
  entregue: "Entregue",
  cancelada: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  aberta: "#3b82f6",
  em_andamento: "#f59e0b",
  aguardando_peca: "#a855f7",
  pronta: "#10b981",
  entregue: "#22c55e",
  cancelada: "#ef4444",
};

const PRIORITY_COLORS: Record<string, string> = {
  baixa: "#94a3b8",
  normal: "#3b82f6",
  alta: "#f59e0b",
  urgente: "#ef4444",
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function ProdutividadePage() {
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const since = useMemo(() => startOfDay(subDays(new Date(), range)).toISOString(), [range]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["productivity", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_orders")
        .select("id, status, priority, entry_date, delivery_date, created_at, total_value, technician_id, equipment")
        .gte("created_at", since);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: technicians } = useQuery({
    queryKey: ["technicians-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name");
      return data ?? [];
    },
  });

  const metrics = useMemo(() => {
    if (!orders) return null;
    const total = orders.length;
    const delivered = orders.filter((o) => o.status === "entregue");
    const open = orders.filter((o) => !["entregue", "cancelada"].includes(o.status));
    const revenue = delivered.reduce((s, o) => s + Number(o.total_value ?? 0), 0);

    const turnaroundHours = delivered
      .filter((o) => o.delivery_date && o.entry_date)
      .map((o) => differenceInHours(new Date(o.delivery_date!), new Date(o.entry_date)))
      .filter((h) => h >= 0);
    const avgTurnaround = turnaroundHours.length
      ? turnaroundHours.reduce((a, b) => a + b, 0) / turnaroundHours.length
      : 0;

    const completionRate = total > 0 ? (delivered.length / total) * 100 : 0;
    return { total, delivered: delivered.length, open: open.length, revenue, avgTurnaround, completionRate };
  }, [orders]);

  const daily = useMemo(() => {
    if (!orders) return [];
    const buckets = new Map<string, { date: string; abertas: number; entregues: number }>();
    for (let i = range - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "dd/MM");
      buckets.set(d, { date: d, abertas: 0, entregues: 0 });
    }
    orders.forEach((o) => {
      const k = format(new Date(o.created_at), "dd/MM");
      const b = buckets.get(k);
      if (b) b.abertas += 1;
      if (o.delivery_date) {
        const dk = format(new Date(o.delivery_date), "dd/MM");
        const db = buckets.get(dk);
        if (db) db.entregues += 1;
      }
    });
    return Array.from(buckets.values());
  }, [orders, range]);

  const byStatus = useMemo(() => {
    if (!orders) return [];
    const counts: Record<string, number> = {};
    orders.forEach((o) => (counts[o.status] = (counts[o.status] ?? 0) + 1));
    return Object.entries(counts).map(([k, v]) => ({
      name: STATUS_LABELS[k] ?? k,
      value: v,
      color: STATUS_COLORS[k] ?? "#64748b",
    }));
  }, [orders]);

  const byPriority = useMemo(() => {
    if (!orders) return [];
    const counts: Record<string, number> = {};
    orders.forEach((o) => (counts[o.priority] = (counts[o.priority] ?? 0) + 1));
    return Object.entries(counts).map(([k, v]) => ({
      name: k,
      value: v,
      color: PRIORITY_COLORS[k] ?? "#64748b",
    }));
  }, [orders]);

  const byTechnician = useMemo(() => {
    if (!orders || !technicians) return [];
    const nameOf = (id: string | null) =>
      technicians.find((t) => t.id === id)?.full_name?.split(" ")[0] ?? "Sem técnico";
    const map = new Map<string, { name: string; total: number; entregues: number }>();
    orders.forEach((o) => {
      const name = nameOf(o.technician_id);
      const cur = map.get(name) ?? { name, total: 0, entregues: 0 };
      cur.total += 1;
      if (o.status === "entregue") cur.entregues += 1;
      map.set(name, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [orders, technicians]);

  const topEquipments = useMemo(() => {
    if (!orders) return [];
    const counts: Record<string, number> = {};
    orders.forEach((o) => (counts[o.equipment] = (counts[o.equipment] ?? 0) + 1));
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [orders]);

  const cards = [
    { label: "OS no período", value: metrics?.total ?? 0, icon: Activity, color: "from-blue-500 to-blue-700" },
    { label: "Entregues", value: metrics?.delivered ?? 0, icon: CheckCircle2, color: "from-green-500 to-green-700" },
    { label: "Em aberto", value: metrics?.open ?? 0, icon: Wrench, color: "from-orange-500 to-orange-700" },
    { label: "Taxa de conclusão", value: `${(metrics?.completionRate ?? 0).toFixed(1)}%`, icon: TrendingUp, color: "from-purple-500 to-purple-700" },
    { label: "Tempo médio", value: metrics ? `${Math.round(metrics.avgTurnaround)}h` : "0h", icon: Clock, color: "from-indigo-500 to-indigo-700" },
    { label: "Receita entregue", value: BRL.format(metrics?.revenue ?? 0), icon: DollarSign, color: "from-emerald-500 to-emerald-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Produtividade</h1>
          <p className="text-muted-foreground">
            Indicadores de desempenho — últimos {range} dias ({format(new Date(since), "dd MMM", { locale: ptBR })} até hoje).
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-card p-1">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as 7 | 30 | 90)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r} dias
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="font-display text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">Carregando dados…</div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h2 className="mb-4 font-display font-bold">Fluxo diário de OS</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="abertas" name="Abertas" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="entregues" name="Entregues" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display font-bold">Distribuição por status</h2>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                      {byStatus.map((e, i) => (<Cell key={i} fill={e.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 font-display font-bold">Prioridades</h2>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byPriority} dataKey="value" nameKey="name" outerRadius={90}>
                      {byPriority.map((e, i) => (<Cell key={i} fill={e.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h2 className="mb-4 font-display font-bold">Produtividade por técnico</h2>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={byTechnician}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                    <Bar dataKey="total" name="Atribuídas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="entregues" name="Entregues" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display font-bold">Equipamentos mais atendidos</h2>
            {topEquipments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sem dados no período.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={topEquipments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={140} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#a855f7" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
