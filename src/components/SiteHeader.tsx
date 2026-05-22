import { Link } from "@tanstack/react-router";
import { BUSINESS, whatsappLink } from "@/lib/business";
import { MessageCircle, Cpu } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <Cpu className="h-5 w-5" />
          </span>
          <span>{BUSINESS.name}</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="/#servicos" className="transition hover:text-foreground">Serviços</a>
          <a href="/#sobre" className="transition hover:text-foreground">Sobre</a>
          <a href="/#contato" className="transition hover:text-foreground">Contato</a>
          <Link to="/login" className="transition hover:text-foreground">Área Técnica</Link>
        </nav>
        <a
          href={whatsappLink(`Olá ${BUSINESS.name}, preciso de um orçamento.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--whatsapp)] px-4 py-2 text-sm font-semibold text-[color:var(--whatsapp-foreground)] shadow-[var(--shadow-soft)] transition hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}
