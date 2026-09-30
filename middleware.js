import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Har so'rovda sessiya cookie'sini yangilab turadi
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession cookie'dan o'qiydi va faqat muddati tugagan bo'lsa yangilaydi (har so'rovda tarmoq yo'q).
  // Haqiqiy tekshiruv sahifada: profil so'rovi va RLS.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Kabinet sahifalari faqat tizimga kirganlar uchun
  if (!session && request.nextUrl.pathname.startsWith('/kabinet')) {
    const url = request.nextUrl.clone();
    url.pathname = '/kirish';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
