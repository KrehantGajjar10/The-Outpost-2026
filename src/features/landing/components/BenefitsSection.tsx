import { CheckCircle2, ShieldCheck, Clock, Layers, Sparkles } from 'lucide-react'
import { Card } from '../../../components/ui/Card'

export function BenefitsSection() {
  const benefits = [
    {
      title: 'Centralized Requirements Matrix',
      description:
        'Keep track of every essay prompt, required letter of recommendation, and transcript verification in one unified dashboard instead of ten separate portal logins.',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      highlight: 'Unified checklists',
    },
    {
      title: 'Proactive Deadline Intelligence',
      description:
        'Urgency flags provide both visual and text-based deadline warnings (Urgent 7 days, Upcoming 21 days), ensuring no milestone catches you by surprise.',
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      highlight: 'Multi-modal alerts',
    },
    {
      title: 'Transparent Financial Pipeline',
      description:
        'Real-time calculations sum your potential funding pipeline against secured awards, helping you plan tuition balances and housing costs accurately.',
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
      highlight: 'Grounded totals',
    },
    {
      title: 'Zero Hidden Criteria or Traps',
      description:
        'Clear distinctions between renewable grants, one-time stipends, and non-repayable awards, with explicit GPA renewal conditions displayed upfront.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      highlight: 'Clear terms',
    },
  ]

  return (
    <section id="benefits" className="py-20 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            Why Grantly
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest-900">
            Designed specifically for student success.
          </h2>
          <p className="text-base text-warm-600 leading-relaxed">
            Unlike commercial directory websites loaded with advertisements and outdated links, GRANTLY is built around student workflows and transparent financial data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              variant="default"
              className="p-8 hover:shadow-md transition-shadow relative overflow-hidden bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest-900 flex items-center justify-center shrink-0 border border-forest-700/40 shadow-xs">
                  {benefit.icon}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-forest-900">{benefit.title}</h3>
                  </div>
                  <p className="text-sm text-warm-600 leading-relaxed">
                    {benefit.description}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-medium text-forest-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{benefit.highlight}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
