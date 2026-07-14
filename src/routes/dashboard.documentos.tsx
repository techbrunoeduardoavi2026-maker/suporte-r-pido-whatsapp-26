import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS, whatsappLink } from "@/lib/business";
import { FileText, Receipt, Plus, Trash2, Printer, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/documentos")({
  component: DocumentosPage,
});

type DocKind = "orcamento" | "nota";

type Item = { id: string; description: string; qty: number; price: number };

type OrderRow = {
  id: string;
  order_number: number;
  equipment: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  reported_issue: string;
  diagnosis: string | null;
  service_performed: string | null;
  total_value: number | null;
  entry_date: string;
  customers: { id: string; name: string; phone: string | null; email: string | null; address: string | null } | null;
};

const uid = () => Math.random().toString(36).slice(2, 9);
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function DocumentosPage() {
  const [kind, setKind] = useState<DocKind>("orcamento");
  const [orderId, setOrderId] = useState<string>("");
  const [items, setItems] = useState<Item[]>([{ id: uid(), description: "", qty: 1, price: 0 }]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [validity, setValidity] = useState<number>(7);
  const [payment, setPayment] = useState<string>("PIX, Dinheiro ou Cartão");

  const { data: orders = [] } = useQuery({
    queryKey: ["orders-for-doc"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_orders")
        .select("id, order_number, equipment, brand, model, serial_number, reported_issue, diagnosis, service_performed, total_value, entry_date, customers(id, name, phone, email, address)")
        .order("order_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

  const order = useMemo(() => orders.find((o) => o.id === orderId) ?? null, [orders, orderId]);

  // Auto-preencher primeiro item ao selecionar OS
  function pickOrder(id: string) {
    setOrderId(id);
    const o = orders.find((x) => x.id === id);
    if (o && items.length === 1 && !items[0].description && !items[0].price) {
      setItems([{
        id: uid(),
        description: o.service_performed || o.diagnosis || `Serviço técnico - ${o.equipment}`,
        qty: 1,
        price: Number(o.total_value ?? 0),
      }]);
    }
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = Math.max(0, subtotal - discount);

  const docNumber = useMemo(() => {
    const n = order?.order_number ?? Math.floor(Math.random() * 9000 + 1000);
    return `${kind === "orcamento" ? "ORC" : "NF"}-${String(n).padStart(5, "0")}`;
  }, [order, kind]);

  const canPrint = !!order && items.some((i) => i.description.trim());

  function addItem() { setItems((s) => [...s, { id: uid(), description: "", qty: 1, price: 0 }]); }
  function removeItem(id: string) { setItems((s) => s.length > 1 ? s.filter((i) => i.id !== id) : s); }
  function updateItem(id: string, patch: Partial<Item>) {
    setItems((s) => s.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function sendWhats() {
    if (!order?.customers?.phone) return;
    const lines = [
      `Olá, ${order.customers.name}! Segue o ${kind === "orcamento" ? "orçamento" : "detalhe da nota"} referente à OS #${order.order_number}:`,
      "",
      ...items.filter((i) => i.description.trim()).map((i) => `• ${i.description} — ${i.qty}x ${brl(i.price)}`),
      "",
      `*Total: ${brl(total)}*`,
      kind === "orcamento" ? `Validade: ${validity} dias` : "",
      `Pagamento: ${payment}`,
      "",
      `— ${BUSINESS.name}`,
    ].filter(Boolean).join("\n");
    const phone = (order.customers.phone || "").replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/55${phone.replace(/^55/, "")}?text=${encodeURIComponent(lines)}`
      : whatsappLink(lines);
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">Gere orçamentos e notas de serviço a partir de uma OS.</p>
      </div>

      {/* Config card */}
      <div className="print:hidden rounded-2xl border border-border bg-card p-5 space-y-5">
        <div className="flex gap-2">
          <button
            onClick={() => setKind("orcamento")}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition ${kind === "orcamento" ? "bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-soft)]" : "border border-border hover:bg-secondary"}`}
          >
            <FileText className="h-4 w-4" /> Orçamento
          </button>
          <button
            onClick={() => setKind("nota")}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold transition ${kind === "nota" ? "bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-soft)]" : "border border-border hover:bg-secondary"}`}
          >
            <Receipt className="h-4 w-4" /> Nota de Serviço
          </button>
        </div>

        <div>
          <label className="text-sm font-medium">Ordem de Serviço *</label>
          <select
            value={orderId}
            onChange={(e) => pickOrder(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
          >
            <option value="">Selecione uma OS...</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.order_number} — {o.customers?.name ?? "Sem cliente"} — {o.equipment}
              </option>
            ))}
          </select>
          {orders.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">Cadastre uma OS primeiro.</p>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Itens (serviços e peças)</label>
            <button onClick={addItem} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Adicionar item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="grid grid-cols-12 gap-2">
                <input
                  value={it.description}
                  onChange={(e) => updateItem(it.id, { description: e.target.value })}
                  placeholder="Descrição do serviço ou peça"
                  className="col-span-12 sm:col-span-6 h-10 rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
                />
                <input
                  type="number" min={1}
                  value={it.qty}
                  onChange={(e) => updateItem(it.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                  placeholder="Qtd"
                  className="col-span-4 sm:col-span-2 h-10 rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
                />
                <input
                  type="number" step="0.01" min={0}
                  value={it.price}
                  onChange={(e) => updateItem(it.id, { price: Number(e.target.value) || 0 })}
                  placeholder="Preço"
                  className="col-span-6 sm:col-span-3 h-10 rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
                />
                <button
                  onClick={() => removeItem(it.id)}
                  className="col-span-2 sm:col-span-1 grid place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Desconto (R$)</label>
            <input
              type="number" step="0.01" min={0}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
            />
          </div>
          {kind === "orcamento" && (
            <div>
              <label className="text-sm font-medium">Validade (dias)</label>
              <input
                type="number" min={1}
                value={validity}
                onChange={(e) => setValidity(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
              />
            </div>
          )}
          <div className={kind === "orcamento" ? "" : "sm:col-span-2"}>
            <label className="text-sm font-medium">Forma de pagamento</label>
            <input
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Observações</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Garantia de 90 dias sobre o serviço executado (Art. 26, CDC)."
            className="mt-1.5 w-full rounded-lg border border-input bg-background p-3 outline-none ring-ring focus:ring-2"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            disabled={!canPrint}
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--gradient-hero)] px-5 py-2.5 font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
          </button>
          <button
            disabled={!canPrint || !order?.customers?.phone}
            onClick={sendWhats}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 font-semibold hover:bg-secondary disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
          </button>
        </div>
      </div>

      {/* Preview / Print */}
      {order && (
        <div className="doc-print mx-auto w-full max-w-[820px] rounded-2xl border border-border bg-white p-8 text-[13px] text-neutral-900 shadow-[var(--shadow-soft)] print:rounded-none print:border-0 print:shadow-none print:p-10">
          <header className="flex items-start justify-between border-b-2 border-neutral-900 pb-4">
            <div>
              <div className="text-2xl font-bold">{BUSINESS.name}</div>
              <div className="text-neutral-600">{BUSINESS.tagline}</div>
              <div className="mt-1 text-xs text-neutral-600">
                {BUSINESS.city} · {BUSINESS.whatsappDisplay} · {BUSINESS.email}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-neutral-500">
                {kind === "orcamento" ? "Orçamento" : "Nota de Serviço"}
              </div>
              <div className="text-xl font-bold">{docNumber}</div>
              <div className="text-xs text-neutral-600">
                Emissão: {new Date().toLocaleDateString("pt-BR")}
              </div>
            </div>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Cliente</div>
              <div className="mt-1 font-semibold">{order.customers?.name}</div>
              {order.customers?.phone && <div className="text-neutral-700">{order.customers.phone}</div>}
              {order.customers?.email && <div className="text-neutral-700">{order.customers.email}</div>}
              {order.customers?.address && <div className="text-neutral-700">{order.customers.address}</div>}
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Equipamento</div>
              <div className="mt-1 font-semibold">{order.equipment}</div>
              <div className="text-neutral-700">
                {[order.brand, order.model].filter(Boolean).join(" · ") || "—"}
              </div>
              {order.serial_number && <div className="text-neutral-700">S/N: {order.serial_number}</div>}
              <div className="text-neutral-700">OS #{order.order_number}</div>
            </div>
          </section>

          {(order.reported_issue || order.diagnosis) && (
            <section className="mt-5 rounded-lg bg-neutral-50 p-3 print:bg-transparent print:border print:border-neutral-300">
              {order.reported_issue && (
                <div><span className="font-semibold">Defeito relatado:</span> {order.reported_issue}</div>
              )}
              {order.diagnosis && (
                <div className="mt-1"><span className="font-semibold">Diagnóstico:</span> {order.diagnosis}</div>
              )}
            </section>
          )}

          <table className="mt-5 w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-neutral-900 text-left">
                <th className="py-2">Descrição</th>
                <th className="py-2 w-16 text-center">Qtd</th>
                <th className="py-2 w-28 text-right">Unitário</th>
                <th className="py-2 w-28 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.filter((i) => i.description.trim()).map((i) => (
                <tr key={i.id} className="border-b border-neutral-200">
                  <td className="py-2 pr-2">{i.description}</td>
                  <td className="py-2 text-center">{i.qty}</td>
                  <td className="py-2 text-right">{brl(i.price)}</td>
                  <td className="py-2 text-right">{brl(i.qty * i.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="mt-4 flex justify-end">
            <div className="w-full max-w-xs space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-neutral-600"><span>Desconto</span><span>-{brl(discount)}</span></div>
              )}
              <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-lg font-bold">
                <span>Total</span><span>{brl(total)}</span>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-6 text-xs text-neutral-700">
            <div>
              <div className="font-semibold text-neutral-900">Forma de pagamento</div>
              <div>{payment}</div>
              {kind === "orcamento" && (
                <>
                  <div className="mt-2 font-semibold text-neutral-900">Validade</div>
                  <div>{validity} dias a partir da emissão</div>
                </>
              )}
            </div>
            <div>
              <div className="font-semibold text-neutral-900">Observações</div>
              <div className="whitespace-pre-wrap">
                {notes || "Garantia de 90 dias sobre o serviço executado, conforme Art. 26 do CDC. Peças substituídas seguem garantia do fabricante."}
              </div>
            </div>
          </section>

          {kind === "nota" && (
            <section className="mt-10 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-t border-neutral-900 pt-2">Assinatura do prestador</div>
                <div className="mt-1 font-semibold">{BUSINESS.name}</div>
              </div>
              <div>
                <div className="border-t border-neutral-900 pt-2">Assinatura do cliente</div>
                <div className="mt-1 font-semibold">{order.customers?.name}</div>
              </div>
            </section>
          )}

          <footer className="mt-8 border-t border-neutral-300 pt-3 text-center text-[11px] text-neutral-500">
            {BUSINESS.name} · {BUSINESS.whatsappDisplay} · {BUSINESS.email}
          </footer>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
          .doc-print { max-width: none !important; }
        }
      `}</style>
    </div>
  );
}
