// app/precios/login/LoginClient.tsx  (CLIENT component)
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0033A0] text-white">
        <div className="animate-pulse">Cargando…</div>
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const { status } = useSession();
  const search = useSearchParams();

  const callbackUrl = search.get("callbackUrl") ?? "/precios";
  const errorParam = search.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/precios");
  }, [status, router]);

  useEffect(() => {
    if (!errorParam) return;
    const map: Record<string, string> = {
      CredentialsSignin: "Usuario o contraseña incorrectos.",
      SessionRequired: "Tenés que iniciar sesión para continuar.",
      Default: "No se pudo iniciar sesión.",
    };
    setErrorMsg(map[errorParam] || map.Default);
  }, [errorParam]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
      callbackUrl,
    });

    setSubmitting(false);

    if (!res) {
      setErrorMsg("No se pudo contactar al servidor.");
      return;
    }
    if (res.error) {
      setErrorMsg("Usuario o contraseña incorrectos.");
      return;
    }
    router.replace(res.url || "/precios");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0033A0] text-white">
        <div className="animate-pulse">Cargando…</div>
      </div>
    );
  }

  // === Tu UI original ===
  return (
    <main className="min-h-screen bg-[#f6f8fb] flex flex-col">
      <div
        className="w-full bg-[#0033A0] text-white"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-3">
          <img
            src="/logo-grupo-gen.jpg"
            alt="Grupo GEN"
            className="h-8 w-8 rounded-full object-cover"
          />
          <h1 className="text-lg font-semibold">Panel de precios</h1>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-md px-5 pt-8 pb-16">
          <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 p-5 sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="text-sm text-neutral-500 mt-1">
              Acceso restringido — solo personal autorizado.
            </p>

            {errorMsg && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm px-3 py-2">
                {errorMsg}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Usuario</label>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0033A0]"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 pr-12 outline-none focus:ring-2 focus:ring-[#0033A0]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-500 hover:text-neutral-700 px-2 py-1"
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#0033A0] text-white font-semibold py-2.5 hover:brightness-110 disabled:opacity-70"
              >
                {submitting ? "Ingresando…" : "Entrar"}
              </button>

              <p className="text-[11px] text-neutral-500 text-center mt-2">
                Consejo: guardá esta URL como acceso directo:{" "}
                <span className="font-medium">/precios</span>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-neutral-500 mt-6">
            © {new Date().getFullYear()} Grupo GEN — Estaciones YPF
          </p>
        </div>
      </div>
    </main>
  );
}
