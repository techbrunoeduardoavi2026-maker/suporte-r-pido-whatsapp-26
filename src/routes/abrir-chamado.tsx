import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { openTicket } from "@/lib/tickets.functions";
import { BUSINESS, whatsappLink } from "@/lib/business";
import { SiteHeader } from "@/components/SiteHeader";
import { Cpu, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/abrir-chamado")({
  head: () => ({
    meta: [
      { title: `Abrir Chamado — ${BUSINESS.name}` },
      { name: "description", content: "Abra um chamado de assistência técnica online. Descreva o problema e retornaremos com o diagnóstico." },
    ],
  }),
  component: OpenTicketPage,
});

function OpenTicketPage() {
  const submit = useServerFn(openTicket);
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    equipment: "", brand: "", model: "", reported_issue: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submit({ data: form });
      setTicket(res.order_number);
      toast.success(`Chamado #${res.order_number} aberto!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao abrir chamado");
    } finally {
      setLoading(false);
    }
  }

  if (ticket !== null) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto max-w-xl px-4 py-24">
          <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-bold">Chamado recebido!</h1>
            <p className="mt-2 text-muted-foreground">
              Seu protocolo é <span className="font-mono font-bold text-foreground">#{ticket}</span>.
              Em breve entraremos em contato para dar sequência ao atendimento.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={whatsappLink(`Olá, acabei de abrir o chamado #${ticket}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--whatsapp)] px-5 py-2.5 font-semibold text-[color:var(--whatsapp-foreground)]"
              >
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-semibold">
                Voltar ao site
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Cpu className="h-3.5 w-3.5" /> Novo chamado
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold">Abrir chamado técnico</h1>
          <p className="mt-2 text-muted-foreground">
            Preencha os dados abaixo. Você receberá um número de protocolo e retorno em até 24h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Seu nome *">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Telefone / WhatsApp *">
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(47) 99999-9999" className={inputCls} />
            </Field>
          </div>
          <Field label="E-mail (opcional)">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Equipamento *">
              <input required value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} placeholder="Notebook, Desktop..." className={inputCls} />
            </Field>
            <Field label="Marca">
              <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Modelo">
              <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="Descreva o problema *">
            <textarea
              required rows={5}
              value={form.reported_issue}
              onChange={(e) => setForm({ ...form, reported_issue: e.target.value })}
              placeholder="Conte com o máximo de detalhes o que está acontecendo..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 outline-none ring-ring focus:ring-2"
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-hero)] font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Abrir chamado
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls = "h-11 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
