/**
 * Serializes JSON-LD safely. `<` is escaped so a stray value can never close
 * the script tag and inject markup.
 */
export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  )
}
