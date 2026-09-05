import type { TrustBadge as TrustBadgeModel } from '@/lib/content/trust'

const TONE_CLASSES = {
  verified: 'bg-green-50 text-green-800 border-green-200',
  pending: 'bg-amber-50 text-amber-900 border-amber-200',
  unavailable: 'bg-red-50 text-red-800 border-red-200',
} as const

export function TrustBadge({
  badge,
  size = 'md',
  showHelp = false,
}: {
  badge: TrustBadgeModel
  size?: 'sm' | 'md'
  showHelp?: boolean
}) {
  return (
    <div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
          TONE_CLASSES[badge.tone]
        } ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      >
        <span aria-hidden="true">{badge.dot}</span>
        <span>{badge.label}</span>
      </span>
      {showHelp && <p className="mt-2 text-sm text-ink-muted">{badge.help}</p>}
    </div>
  )
}

/** The "what these badges mean" legend, used on the methodology page. */
export function TrustLegend({ badges }: { badges: TrustBadgeModel[] }) {
  return (
    <dl className="space-y-4">
      {badges.map((badge) => (
        <div key={badge.status} className="flex gap-3">
          <dt className="shrink-0 pt-0.5">
            <TrustBadge badge={badge} size="sm" />
          </dt>
          <dd className="text-sm text-ink-muted">{badge.help}</dd>
        </div>
      ))}
    </dl>
  )
}
