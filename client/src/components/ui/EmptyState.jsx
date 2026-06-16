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
      {Icon && <Icon size={48} className="text-[#242424]" />}
      <h3 className="font-serif text-xl text-white">{heading}</h3>
      {subtext && <p className="text-[#5C5C5C] text-sm max-w-xs">{subtext}</p>}
      {ctaLabel && onCta && (
        <Button onClick={onCta} className="mt-2">
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
