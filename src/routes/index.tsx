import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { BUSINESS, whatsappLink } from "@/lib/business";
import {
  Laptop, HardDrive, Wifi, ShieldCheck, Wrench, Cpu,
  MessageCircle, Clock, MapPin, Mail, ArrowRight, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BUSINESS.name} — Assistência Técnica em Informática` },
      { name: "description", content: `Conserto de notebooks, desktops e redes em ${BUSINESS.city}. Diagnóstico rápido, peças com garantia e atendimento direto pelo WhatsApp.` },
      { property: "og:title", content: `${BUSINESS.name} — Assistência Técnica em Informática` },
      { property: "og:description", content: "Conserto de notebooks, desktops e redes. Atendimento via WhatsApp." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Laptop, title: "Notebooks & Desktops", desc: "Formatação, troca de telas, teclados, baterias e upgrades de hardware." },
  { icon: HardDrive, title: "Recuperação de Dados", desc: "Resgate de arquivos em HDs, SSDs e pendrives danificados." },
  { icon: Wifi, title: "Redes & Wi-Fi", desc: "Instalação de roteadores, cabeamento estruturado e configuração de redes." },
  { icon: ShieldCheck, title: "Remoção de Vírus", desc: "Limpeza completa, otimização e instalação de antivírus profissional." },
  { icon: Cpu, title: "Montagem de PCs", desc: "Computadores sob medida para trabalho, estudo, design ou gaming." },
  { icon: Wrench, title: "Manutenção Preventiva", desc: "Limpeza interna, troca de pasta térmica e diagnóstico completo." },
];

const stats = [
  { value: "500+", label: "Equipamentos consertados" },
  { value: "98%", label: "Clientes satisfeitos" },
  { value: "24h", label: "Diagnóstico médio" },
  { value: "6 meses", label: "Garantia nos serviços" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-tech)] text-white">
        <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,oklch(0.55_0.2_290/0.3),transparent_50%)]" />
        <div className="container relative mx-auto grid gap-12 px-4 py-24 md:py-32 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/80 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[color:var(--whatsapp)]" />
              Atendendo em {BUSINESS.city}
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              Seu computador <br />
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                de volta ao normal.
              </span>
            </h1>
            <p className="max-w-lg text-lg text-white/70">
              Assistência técnica especializada em notebooks, desktops e redes.
              Diagnóstico transparente, orçamento rápido e atendimento humano direto pelo WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappLink(`Olá ${BUSINESS.name}, gostaria de um orçamento.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--whatsapp)] px-6 py-3 font-semibold text-[color:var(--whatsapp-foreground)] shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
              >
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <a
                href="#servicos"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Ver serviços
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/60">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[color:var(--whatsapp)]" /> Garantia em todos os serviços</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[color:var(--whatsapp)]" /> Sem taxa de visita</span>
            </div>
          </div>

          {/* Stat card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-white/10 to-transparent blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/5 p-6">
                  <div className="font-display text-4xl font-bold">{s.value}</div>
                  <div className="mt-1 text-sm text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">O que fazemos</span>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">Serviços completos para você e sua empresa</h2>
          <p className="mt-4 text-muted-foreground">
            Soluções rápidas e confiáveis para todo tipo de problema em informática.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[image:var(--gradient-hero)] opacity-0 blur-3xl transition group-hover:opacity-20" />
              <div className="relative">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--shadow-soft)]">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="bg-secondary/40 py-24">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Sobre</span>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
              Mais de uma década consertando o que outros desistem.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Sou {BUSINESS.name}, técnico em informática apaixonado por resolver problemas.
              Atendo clientes residenciais e empresariais com transparência total — você acompanha
              cada etapa do reparo e só aprova o serviço após o orçamento.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Orçamento gratuito antes de qualquer reparo",
                "Peças originais com nota fiscal",
                "Atendimento na bancada ou no local",
                "Acompanhamento da ordem de serviço",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative rounded-3xl border border-border bg-card p-10 shadow-[var(--shadow-soft)]">
            <div className="absolute -top-4 left-10 rounded-full bg-[image:var(--gradient-hero)] px-4 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              Processo
            </div>
            <ol className="space-y-6">
              {[
                { t: "Contato", d: "Chame no WhatsApp e descreva o problema." },
                { t: "Diagnóstico", d: "Avaliamos o equipamento em até 24 horas." },
                { t: "Orçamento", d: "Você aprova antes de qualquer serviço." },
                { t: "Entrega", d: "Equipamento testado e funcionando, com garantia." },
              ].map((step, i) => (
                <li key={step.t} className="flex gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold">{step.t}</h4>
                    <p className="text-sm text-muted-foreground">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CONTATO / CTA */}
      <section id="contato" className="container mx-auto px-4 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-tech)] p-12 text-white md:p-16">
          <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-60" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-4xl font-bold md:text-5xl">Pronto para resolver?</h2>
              <p className="mt-4 max-w-md text-white/70">
                Mande uma mensagem no WhatsApp e receba seu orçamento sem compromisso.
                Atendimento humano, sem robôs.
              </p>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--whatsapp)] px-7 py-3.5 font-semibold text-[color:var(--whatsapp-foreground)] shadow-[var(--shadow-glow)] transition hover:scale-[1.02]"
              >
                <MessageCircle className="h-5 w-5" />
                {BUSINESS.whatsappDisplay}
              </a>
            </div>
            <div className="space-y-4">
              {[
                { icon: Clock, t: "Horário", d: "Seg a Sex 8h–18h · Sáb 8h–12h" },
                { icon: MapPin, t: "Região", d: `Atendimento em ${BUSINESS.city}` },
                { icon: Mail, t: "E-mail", d: BUSINESS.email },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/60">{c.t}</div>
                    <div className="font-medium">{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} {BUSINESS.name} — Assistência Técnica em Informática.</p>
          <Link to="/login" className="hover:text-foreground">Área Técnica →</Link>
        </div>
      </footer>

      <WhatsAppFloat />
    </div>
  );
}
