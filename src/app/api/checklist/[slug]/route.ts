import { NextResponse } from 'next/server'
import { getPublishedProcedure } from '@/lib/content/queries'
import { buildChecklistText } from '@/lib/content/checklist'
import { isLocale, defaultLocale } from '@/lib/i18n/config'
import { siteUrl } from '@/lib/env'

export const runtime = 'nodejs'

/** Downloadable plain-text document checklist. */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const url = new URL(request.url)
  const requested = url.searchParams.get('locale') ?? defaultLocale
  const locale = isLocale(requested) ? requested : defaultLocale

  const procedure = await getPublishedProcedure(slug)
  if (!procedure) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const text = buildChecklistText(procedure, locale, siteUrl)

  return new NextResponse(text, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': `attachment; filename="kagaj-k-ho-${slug}-${locale}.txt"`,
      'cache-control': 'public, max-age=300',
    },
  })
}
