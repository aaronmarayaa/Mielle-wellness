import { Button } from './ui/button'

const treatments = [
  { title: 'Relaxation Massage', price: 70, mobilePrice: 100, image: 'service-relaxation.jpg', alt: 'A client resting during a relaxation massage' },
  { title: 'Deep Tissue Therapeutic Massage', price: 70, mobilePrice: 100, image: 'service-deep-tissue.jpg', alt: 'A therapist applying focused pressure to a client’s back' },
  { title: 'Cupping Therapy', price: 80, mobilePrice: 110, image: 'service-cupping.jpg', alt: 'Glass cups being placed on a client’s back' },
  { title: 'Hot Stone Massage Therapy', price: 135, mobilePrice: 165, image: 'service-hot-stone.jpg', alt: 'Smooth heated stones arranged on a client’s back' },
  { title: 'Youth Massage (16 years old under)', price: 70, mobilePrice: 100, image: 'service-youth.jpg', alt: 'A therapist gently supporting a client’s head during a massage' },
  { title: 'Pre-Natal Massage (15weeks above)', price: 90, mobilePrice: 120, image: 'service-prenatal.jpg', alt: 'A client lying on their side during a prenatal massage' },
  { title: 'Thai Massage Therapy (on Bed)', price: 90, mobilePrice: 120, image: 'service-thai.jpg', alt: 'A therapist guiding a client through an assisted Thai massage stretch' },
  { title: 'Lymphatic Drainage Massage', price: 80, mobilePrice: 110, image: 'service-lymphatic.jpg', alt: 'Hands applying gentle massage strokes to a client’s back' },
]

const servicePages = {
  'in-clinic': { title: 'In-Clinic Services', description: 'Treat yourself to a calming escape in a warm and welcoming space created for your comfort. Relax away from home, release tension, and enjoy a moment of peace just for you.' },
  mobile: { title: 'Mobile Services', description: 'Skip the travel and enjoy professional massage therapy in the comfort of your own home. We bring care, comfort, and relaxation to you so you can fully unwind in the comfort of your own space.' },
}

export function ServicesPage({ onBook, variant = 'overview' }: { onBook: (treatment?: string) => void; variant?: 'overview' | 'in-clinic' | 'mobile' }) {
  const details = variant === 'overview' ? null : servicePages[variant]
  return <>
    <section className="services-page-intro" aria-labelledby="services-page-title">
      <h1 id="services-page-title">{details ? details.title : <>Book One of Our<br />Signature Treatments</>}</h1>
      <p>{details ? details.description : 'Enhance your wellness and embrace life to the fullest through restorative massage experiences designed to relax the body, ease tension, and bring balance to both mind and body.'}</p>
      {details ? <Button className="services-booking" size="lg" asChild><a href="https://miellewellness.noterro.com/" target="_blank" rel="noreferrer">BOOK NOW</a></Button> : <Button className="services-booking" size="lg" onClick={() => onBook()}>BOOK NOW</Button>}
    </section>
    <section className="treatment-gallery" aria-label="Signature treatments">
      {treatments.map(treatment => {
        const price = variant === 'mobile' ? treatment.mobilePrice : treatment.price
        const content = <>
          <span className="treatment-image"><img src={`/assets/${treatment.image}`} alt={treatment.alt} width="640" height="640" loading="lazy" /></span>
          <h2>{treatment.title}</h2>
          {details && <p className="treatment-price">Starting at ${price}</p>}
        </>
        return <article className="treatment-card" key={treatment.image}>
          {details ? <a className="treatment-booking" href="https://miellewellness.noterro.com/" target="_blank" rel="noreferrer" aria-label={`Book ${treatment.title}, starting at $${price}`}>{content}</a> : <button className="treatment-booking" onClick={() => onBook(treatment.title)} aria-label={`Book ${treatment.title}`}>{content}</button>}
        </article>
      })}
    </section>
  </>
}
