'use client'

import { analyticsEnabled } from '@/lib/env'
import type { AnalyticsEventName, AnalyticsProps } from './events'

/**
 * Fire-and-forget client tracking. Never blocks navigation and never throws
 * into the render path — analytics failing must not break a content page.
 */
export function track(name: AnalyticsEventName, props: AnalyticsProps = {}): void {
  if (!analyticsEnabled) return
  const body = JSON.stringify({ name, props })

  try {
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch('/api/analytics', {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/json' },
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Intentionally silent.
  }
}
