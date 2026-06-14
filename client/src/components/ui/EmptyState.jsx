import Button from './Button'

export default function EmptyState({
  icon: Icon,
  heading,
  subtext,
  ctaLabel,
  onCta,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      {Icon && <Icon size={48} className="text-gray-300" />}
      <h3 className="text-xl font-semibold text-[#0A0A0A]">{heading}</h3>
      {subtext && <p className="text-[#6B6B6B] text-sm max-w-xs">{subtext}</p>}
      {ctaLabel && onCta && (
        <Button onClick={onCta} className="mt-2">
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
