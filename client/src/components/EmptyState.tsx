import { ReactNode, ElementType } from 'react'

interface Props {
  icon?: ElementType
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center">
          <Icon size={32} className="text-muted" />
        </div>
      )}
      <div>
        <p className="text-foreground font-semibold text-lg">{title}</p>
        {description && <p className="text-muted text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
