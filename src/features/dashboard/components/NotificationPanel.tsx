import { useEffect, useRef } from 'react'
import { Bell, Check, Clock, AlertTriangle, Info, CheckCheck } from 'lucide-react'
import type { DashboardNotification } from '../types/dashboard'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: DashboardNotification[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onSelectScholarship?: (id: string) => void
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onSelectScholarship,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Application Notifications"
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-warm-300 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="px-4 py-3 border-b border-warm-200 bg-warm-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-forest-700" />
          <h3 className="text-sm font-bold text-forest-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] font-semibold bg-[#e11d48] text-white px-2 py-0.2 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-forest-700 hover:text-forest-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-warm-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-warm-500">No new notifications</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 transition-colors ${
                notif.read ? 'bg-white opacity-80' : 'bg-forest-50/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {notif.urgency === 'high' && (
                    <div className="w-6 h-6 rounded-lg bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {notif.urgency === 'info' && (
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {notif.urgency === 'medium' && (
                    <div className="w-6 h-6 rounded-lg bg-amber-light text-amber-accent flex items-center justify-center">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-semibold text-forest-900 line-clamp-1">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-warm-500 shrink-0 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-warm-600 leading-relaxed">{notif.description}</p>

                  <div className="pt-1 flex items-center justify-between">
                    {notif.relatedScholarshipId && onSelectScholarship ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectScholarship(notif.relatedScholarshipId!)
                          onClose()
                        }}
                        className="text-[11px] font-semibold text-forest-700 hover:underline cursor-pointer"
                      >
                        View scholarship →
                      </button>
                    ) : <span />}

                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => onMarkRead(notif.id)}
                        className="text-[10px] text-warm-500 hover:text-forest-900 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-warm-50 border-t border-warm-200 text-center text-[11px] text-warm-500">
        Simulated notifications for prototype verification
      </div>
    </div>
  )
}
