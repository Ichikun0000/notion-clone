import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Basic認証のユーザー名とパスワードを環境変数から取得
  const basicUser = process.env.BASIC_AUTH_USER
  const basicPassword = process.env.BASIC_AUTH_PASSWORD

  // Basic認証が有効でない場合はスキップ
  if (!basicUser || !basicPassword) {
    return NextResponse.next()
  }

  // Authorization ヘッダーを取得
  const authorizationHeader = request.headers.get('authorization')

  if (!authorizationHeader) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  // Basic認証の値を検証
  const basicAuth = authorizationHeader.split(' ')[1]
  const [user, password] = Buffer.from(basicAuth, 'base64').toString().split(':')

  if (user !== basicUser || password !== basicPassword) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}