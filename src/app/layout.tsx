import { cookies, headers } from 'next/headers'
import { Providers } from './providers'
import { SessionProvider } from './_components/SessionProvider'
import { verifyJWT } from '~/server/utils/jwt'
import { getServerAuthSession } from '~/server/auth'
import './globals.css'

const publicPaths = ['/unauthorized']

async function checkAuthorization(pathname: string) {
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return true
  }


  const session = await getServerAuthSession()
  if (session) {
    return true
  }


  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    return false
  }

  const { success } = await verifyJWT(token.value)
  return success
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const headersList = headers()
  const pathname = headersList.get("x-pathname") || "/"

  const isAuthorized = await checkAuthorization(pathname)

  return (
    <html lang="en">
      <body>
        <Providers>
          <SessionProvider isAuthorized={isAuthorized}>
            {children}
          </SessionProvider>
        </Providers>
      </body>
    </html>
  )
}