interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function Spinner({ size = 'md', text }: Props) {
  const s = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' }[size]
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${s} rounded-full border-border border-t-acid animate-spin`} />
      {text && <p className="text-sm text-muted">{text}</p>}
    </div>
  )
}
