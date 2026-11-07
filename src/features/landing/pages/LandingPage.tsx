import { Header } from '../../../components/shared/Header'
import { Footer } from '../../../components/shared/Footer'
import { HeroSection } from '../components/HeroSection'
import { HowItWorksSection } from '../components/HowItWorksSection'
import { BenefitsSection } from '../components/BenefitsSection'
import { SamplePreviewSection } from '../components/SamplePreviewSection'
import { CtaSection } from '../components/CtaSection'

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50 text-warm-900">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <BenefitsSection />
        <SamplePreviewSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
