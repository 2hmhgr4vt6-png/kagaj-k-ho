/**
 * Anonymous product analytics.
 *
 * Hard rules baked into the type: the event payload has no user identifier, no
 * IP, no user agent and no free text a person could type. Adding a field here
 * that could carry PII is a review-blocking change.
 */
export const ANALYTICS_EVENTS = [
  'search',
  'procedure_view',
  'source_click',
  'report_outdated',
  'language_change',
  'checklist_download',
] as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number]

export type AnalyticsProps = {
  /** Procedure or category slug — public, non-identifying. */
  slug?: string
  categorySlug?: string
  /** Number of search results, not the query itself. */
  resultCount?: number
  /** Whether a search returned nothing — drives the content gap report. */
  zeroResults?: boolean
  locale?: string
  /** Destination host of an outbound official-source click. */
  sourceHost?: string
  reason?: string
}

export function isAnalyticsEvent(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value)
}
