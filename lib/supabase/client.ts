import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie.split('; ').map(cookie => {
            const [name, ...valueParts] = cookie.split('=')
            return { name, value: valueParts.join('=') }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}; path=${options?.path || '/'}; `
            if (options?.maxAge) cookieString += `max-age=${options.maxAge}; `
            if (options?.expires) cookieString += `expires=${new Date(options.expires).toUTCString()}; `
            if (options?.domain) cookieString += `domain=${options.domain}; `
            if (options?.secure) cookieString += 'secure; '
            if (options?.sameSite) cookieString += `samesite=${options.sameSite}; `
            document.cookie = cookieString
          })
        },
      },
    }
  )
}
