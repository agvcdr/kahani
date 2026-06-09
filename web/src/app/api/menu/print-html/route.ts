import { publicClient } from '@/lib/sanity/client'
import { PRINT_MENU_DATA } from '@/lib/sanity/queries'
import { buildPrintHtml } from '@/lib/menu/print-html'
import type { PrintData } from '@/lib/menu/print-html'

export const revalidate = 3600

export async function GET() {
  const data: PrintData = await publicClient.fetch(PRINT_MENU_DATA)
  const html = buildPrintHtml(data)
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
