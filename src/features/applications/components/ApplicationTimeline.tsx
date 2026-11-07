import { Clock, Send, FileText, Calendar, PlusCircle, CheckCircle } from 'lucide-react'
import { formatDisplayDate } from '../../../lib/utils'
import type { ApplicationTimelineEvent } from '../types/application'

interface ApplicationTimelineProps {
  timeline: ApplicationTimelineEvent[]
}

export function ApplicationTimeline({ timeline }: ApplicationTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-warm-500 bg-white rounded-xl border border-warm-200">
        No recorded history yet. Actions you take on documents, status, and notes will appear here.
      </div>
    )
  }

  const getEventIcon = (type: ApplicationTimelineEvent['type']) => {
    switch (type) {
      case 'status_change':
        return <Send className="w-3.5 h-3.5 text-forest-700" />
      case 'document_update':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />
      case 'target_date_set':
        return <Calendar className="w-3.5 h-3.5 text-amber-accent" />
      case 'note_added':
        return <Clock className="w-3.5 h-3.5 text-warm-600" />
      case 'created':
      default:
        return <PlusCircle className="w-3.5 h-3.5 text-forest-700" />
    }
  }

  const formatEventDate = (timestamp: string) => {
    try {
      const d = new Date(timestamp)
      if (isNaN(d.getTime())) return timestamp
      return `${formatDisplayDate(timestamp.slice(0, 10))} at ${d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    } catch {
      return timestamp
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-warm-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-warm-600 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-forest-700" />
          <span>Application Activity &amp; Milestone Timeline</span>
        </h4>
        <span className="text-[11px] text-warm-500">{timeline.length} logged events</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-warm-200">
        {timeline.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline icon node */}
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-warm-100 border-2 border-forest-800 flex items-center justify-center shrink-0">
              {getEventIcon(event.type)}
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-forest-900">{event.title}</span>
                <span className="text-[10px] text-warm-500 font-mono">
                  {formatEventDate(event.timestamp)}
                </span>
              </div>
              <p className="text-xs text-warm-600 leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-warm-50 rounded-xl border border-warm-200 text-[11px] text-warm-500 flex items-center gap-2">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Activity history is stored locally in your browser session and profile snapshot.</span>
      </div>
    </div>
  )
}
