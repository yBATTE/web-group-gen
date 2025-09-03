import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Dejar pasar login, next-auth y estáticos
  if (
    pathname === "/precios/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Proteger /precios (excepto /precios/login) y /api/menu (solo no-GET)
  const isPreciosProtegido =
    pathname === "/precios" || (pathname.startsWith("/precios/") && pathname !== "/precios/login");

  const isApiMenuProtegido = pathname.startsWith("/api/menu") && req.method !== "GET";

  if (isPreciosProtegido || isApiMenuProtegido) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/precios/login", req.url);
      const cb = pathname + (search || "");
      loginUrl.searchParams.set("callbackUrl", cb || "/precios");
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/precios", "/precios/:path*", "/api/menu"],
};
