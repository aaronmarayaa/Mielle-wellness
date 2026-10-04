import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'

export function OfferBanner({ onBook }: { onBook: () => void }) {
  return <section id="first-visit-offer" className="home-offer" aria-labelledby="home-offer-title">
    <div className="offer-banner">
      <div className="offer-copy">
        <p className="eyebrow">EXCLUSIVE OFFER</p>
        <h2 id="home-offer-title">10% Off Your First Appointment</h2>
      </div>
      <Button size="lg" onClick={onBook}>Book your appointment now <ArrowRight aria-hidden="true" size={20} strokeWidth={1.2} /></Button>
    </div>
  </section>
}
