import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function homeFor(role: string | undefined) {
  if (role === "ninja") return "/ninja";
  if (role === "sensei") return "/sensei";
  if (role === "director" || role === "owner") return "/director";
  return "/";
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const role = request.cookies.get("bd_role")?.value;
  const open = path === "/" || path.startsWith("/parent") || path.startsWith("/credits") || path.startsWith("/ninja/sign-in") || path.startsWith("/staff/sign-in") || path.startsWith("/tv");
  if (open) return NextResponse.next();

  const url = request.nextUrl.clone();
  if (!role) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  const staff = role === "sensei" || role === "director" || role === "owner";
  const director = role === "director" || role === "owner";
  if (path.startsWith("/ninja") && role !== "ninja") url.pathname = homeFor(role);
  else if (path.startsWith("/sensei") && !staff) url.pathname = homeFor(role);
  else if (path.startsWith("/director") && !director) url.pathname = homeFor(role);
  else if (path === "/dojo" || path === "/portal" || path === "/staff") url.pathname = homeFor(role);
  else return NextResponse.next();
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next|api|code-ninjas-logo.jpg).*)"] };
