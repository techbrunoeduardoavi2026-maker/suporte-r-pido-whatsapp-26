import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Pencil, Trash2, X, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/ordens")({
  component: OrdensPage,
});

type Status = "aberta" | "em_andamento" | "aguardando_peca" | "pronta" | "entregue" | "cancelada";
type Priority = "baixa" | "normal" | "alta" | "urgente";

type Order = {
  id: string;
  order_number: number;
  customer_id: string;
  equipment: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  reported_issue: string;
  diagnosis: string | null;
  service_performed: string | null;
  status: Status;
  priority: Priority;
  total_value: number | null;
  entry_date: string;
  delivery_date: string | null;
  customers?: { name: string } | null;
};

const STATUS_LABELS: Record<Status, string> = {
  aberta: "Aberta", em_andamento: "Em andamento", aguardando_peca: "Aguardando peça",
  pronta: "Pronta", entregue: "Entregue", cancelada: "Cancelada",
};

const STATUS_COLORS: Record<Status, string> = {
  aberta: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  em_andamento: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  aguardando_peca: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  pronta: "bg-green-500/10 text-green-700 dark:text-green-300",
  entregue: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
  cancelada: "bg-red-500/10 text-red-700 dark:text-red-300",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: "Baixa", normal: "Normal", alta: "Alta", urgente: "Urgente",
};

function OrdensPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [editing, setEditing] = useState<Order | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_orders")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
  });

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.equipment.toLowerCase().includes(q) ||
      String(o.order_number).includes(q) ||
      (o.customers?.name ?? "").toLowerCase().includes(q)
    );
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Ordem removida");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Acompanhe todos os reparos em andamento.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-hero)] px-4 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nova OS
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nº, equipamento ou cliente..."
            className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 outline-none ring-ring focus:ring-2"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Status | "all")}
          className="h-11 rounded-lg border border-input bg-card px-3 outline-none ring-ring focus:ring-2"
        >
          <option value="all">Todos os status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">Nenhuma ordem encontrada.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-border bg-secondary/50 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nº</th>
                <th className="px-4 py-3">Cliente / Equipamento</th>
                <th className="px-4 py-3 hidden md:table-cell">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Prioridade</th>
                <th className="px-4 py-3 hidden lg:table-cell">Valor</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono font-medium">#{o.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.equipment}</div>
                    <div className="text-sm text-muted-foreground">{o.customers?.name ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm">{PRIORITY_LABELS[o.priority]}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm">
                    {o.total_value ? `R$ ${Number(o.total_value).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(o); setShowForm(true); }} className="grid h-8 w-8 place-items-center rounded-md hover:bg-secondary">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Remover OS #${o.order_number}?`)) del.mutate(o.id); }}
                        className="grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <OrderForm order={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function OrderForm({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const qc = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-select"],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, name").order("name");
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    customer_id: order?.customer_id ?? "",
    equipment: order?.equipment ?? "",
    brand: order?.brand ?? "",
    model: order?.model ?? "",
    serial_number: order?.serial_number ?? "",
    reported_issue: order?.reported_issue ?? "",
    diagnosis: order?.diagnosis ?? "",
    service_performed: order?.service_performed ?? "",
    status: (order?.status ?? "aberta") as Status,
    priority: (order?.priority ?? "normal") as Priority,
    total_value: order?.total_value?.toString() ?? "",
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.customer_id) throw new Error("Selecione um cliente");
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        customer_id: form.customer_id,
        equipment: form.equipment,
        brand: form.brand || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        reported_issue: form.reported_issue,
        diagnosis: form.diagnosis || null,
        service_performed: form.service_performed || null,
        status: form.status,
        priority: form.priority,
        total_value: form.total_value ? Number(form.total_value) : 0,
        delivery_date: form.status === "entregue" ? new Date().toISOString() : null,
      };
      if (order) {
        const { error } = await supabase.from("service_orders").update(payload).eq("id", order.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("service_orders").insert({ ...payload, created_by: user?.id, technician_id: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["recent-orders"] });
      toast.success(order ? "Ordem atualizada" : "Ordem criada");
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl my-8 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            {order ? `Editar OS #${order.order_number}` : "Nova Ordem de Serviço"}
          </h2>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Cliente *</label>
            <select
              required
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
            >
              <option value="">Selecione um cliente</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {customers.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">Cadastre um cliente primeiro na aba Clientes.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Equipamento *" required value={form.equipment} onChange={(v) => setForm({ ...form, equipment: v })} placeholder="Ex: Notebook Dell" />
            <Field label="Marca" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
            <Field label="Modelo" value={form.model} onChange={(v) => setForm({ ...form, model: v })} />
            <Field label="Nº de Série" value={form.serial_number} onChange={(v) => setForm({ ...form, serial_number: v })} />
          </div>

          <Textarea label="Defeito relatado *" required value={form.reported_issue} onChange={(v) => setForm({ ...form, reported_issue: v })} />
          <Textarea label="Diagnóstico técnico" value={form.diagnosis} onChange={(v) => setForm({ ...form, diagnosis: v })} />
          <Textarea label="Serviço executado" value={form.service_performed} onChange={(v) => setForm({ ...form, service_performed: v })} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Prioridade</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3">
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <Field label="Valor (R$)" type="number" value={form.total_value} onChange={(v) => setForm({ ...form, total_value: v })} placeholder="0.00" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 font-medium hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={save.isPending} className="rounded-lg bg-[image:var(--gradient-hero)] px-5 py-2 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] disabled:opacity-50">
              {save.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, required }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1.5 w-full rounded-lg border border-input bg-background p-3 outline-none ring-ring focus:ring-2"
      />
    </div>
  );
}
