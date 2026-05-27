import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const docType = body?._type as string | undefined

  if (docType === 'menuItem' || docType === 'menuCategory') {
    revalidatePath('/menu', 'layout')
  } else if (docType === 'setMenu') {
    revalidatePath('/menu', 'layout')
  } else if (docType === 'siteSettings') {
    revalidatePath('/', 'layout')
    revalidatePath('/contact')
    revalidatePath('/about')
  } else {
    revalidatePath('/', 'layout')
  }

  return NextResponse.json({ revalidated: true })
}
