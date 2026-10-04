import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { FaqItem } from '@/lib/types'
import { cn } from '@/lib/cn'

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null)
  return (
    <div className="divide-y divide-graphite-200 border-y border-graphite-200">
      {items.map((item) => {
        const isOpen = open === item.id
        return (
          <div key={item.id}>
            <h3>
              <button
                className="flex w-full items-start justify-between gap-6 py-5 text-left text-base font-semibold text-graphite-900 transition-colors hover:text-brand-700 sm:text-lg"
                aria-expanded={isOpen}
                aria-controls={`faq-${item.id}`}
                onClick={() => setOpen(isOpen ? null : item.id)}
              >
                {item.question}
                <Plus className={cn('mt-1 h-5 w-5 shrink-0 text-brand transition-transform duration-300', isOpen && 'rotate-45')} aria-hidden />
              </button>
            </h3>
            <div id={`faq-${item.id}`} role="region" className={cn('grid transition-all duration-300', isOpen ? 'grid-rows-[1fr] pb-6 opacity-100' : 'grid-rows-[0fr] opacity-0')}>
              <div className="overflow-hidden">
                <p className="max-w-3xl leading-relaxed whitespace-pre-line text-graphite-600">{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
