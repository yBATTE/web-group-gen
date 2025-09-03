// app/precios/login/page.tsx  (SERVER component)
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic"; // evita SSG
export const revalidate = 0;            // sin cache para esta ruta

export default function Page() {
  return <LoginClient />;
}
