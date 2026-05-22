import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUSINESS } from "@/lib/business";
import { Cpu, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: `Login — ${BUSINESS.name}` }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao autenticar";
      toast.error(
        msg.includes("Invalid login") ? "E-mail ou senha incorretos." :
        msg.includes("already registered") ? "Este e-mail já está cadastrado." :
        msg
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[image:var(--gradient-tech)] text-white lg:block">
        <div className="absolute inset-0 bg-[image:var(--gradient-glow)] opacity-70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10"><Cpu className="h-5 w-5" /></span>
            {BUSINESS.name}
          </Link>
          <div>
            <h1 className="font-display text-5xl font-bold leading-tight">
              Gerencie sua <br /> assistência técnica.
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Cadastre clientes, controle ordens de serviço e acompanhe o status de cada reparo em um só lugar.
            </p>
          </div>
          <p className="text-sm text-white/50">© {new Date().getFullYear()} {BUSINESS.name}</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="font-display text-3xl font-bold">
              {mode === "login" ? "Entrar na área técnica" : "Criar conta"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login" ? "Acesse o sistema de gestão." : "O primeiro cadastro vira administrador."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-sm font-medium">Nome completo</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none ring-ring focus:ring-2"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-hero)] font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "login" ? "Cadastre-se" : "Entrar"}
            </button>
          </p>
          <p className="text-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">← Voltar ao site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
