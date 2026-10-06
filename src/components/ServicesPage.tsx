import { Button } from './ui/button'

const treatments = [
  { title: 'Relaxation Massage', price: 70, mobilePrice: 100, image: 'services/relaxation.jpg', width: 6852, height: 4708, alt: 'A client resting during a relaxation massage' },
  { title: 'Deep Tissue Therapeutic Massage', price: 70, mobilePrice: 100, image: 'services/deep-tiissue-therapeutic.jpg', width: 5472, height: 3648, alt: 'A therapist applying focused pressure to a client’s back' },
  { title: 'Cupping Therapy', price: 80, mobilePrice: 110, image: 'services/cupping-therapy.jpg', width: 6048, height: 4024, alt: 'Glass cups being placed on a client’s back' },
  { title: 'Hot Stone Massage Therapy', price: 135, mobilePrice: 165, image: 'services/hot-stone.jpg', width: 6720, height: 4480, alt: 'A therapist massaging a client’s back with smooth heated stones' },
  { title: 'Youth Massage (16 years old under)', price: 70, mobilePrice: 100, image: 'services/youth.jpg', width: 4227, height: 3382, alt: 'A therapist gently massaging a child lying fully clothed on a treatment table' },
  { title: 'Pre-Natal Massage (15weeks above)', price: 90, mobilePrice: 120, image: 'services/pre-natal.jpg', width: 736, height: 414, alt: 'A therapist gently massaging a pregnant client’s abdomen' },
  { title: 'Thai Massage Therapy (on Bed)', price: 90, mobilePrice: 120, image: 'services/thai-massage.jpg', width: 6000, height: 4000, alt: 'A therapist guiding a client through an assisted Thai massage stretch' },
  { title: 'Lymphatic Drainage Massage', price: 80, mobilePrice: 110, image: 'services/lymphatic.jpg', width: 5760, height: 3832, alt: 'A therapist gently massaging a client’s abdomen between white towels' },
]

const treatmentBookingLinks = [
  'https://miellewellness.noterro.com/book-online/service/313471/Relaxation-Massage',
  'https://miellewellness.noterro.com/book-online/service/313490/Deep-Therapeutic-Massage',
  'https://miellewellness.noterro.com/book-online/service/313529/Cupping-Therapy',
  'https://miellewellness.noterro.com/book-online/service/313570/Hot-Stone-Massage',
  'https://miellewellness.noterro.com/book-online/service/313531/Youth-Massage-(3-12years-old)',
  'https://miellewellness.noterro.com/book-online/service/313681/Pre-Natal-Massage-(15weeks-above)',
  'https://miellewellness.noterro.com/book-online/service/313532/Thai-Massage-on-Bed',
  'https://miellewellness.noterro.com/',
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
      {treatments.map((treatment, index) => {
        const price = variant === 'mobile' ? treatment.mobilePrice : treatment.price
        const content = <>
          <span className="treatment-image"><img src={`/assets/${treatment.image}`} alt={treatment.alt} width={treatment.width} height={treatment.height} loading="lazy" /></span>
          <h2>{treatment.title}</h2>
          {details && <p className="treatment-price">Starting at ${price}</p>}
        </>
        return <article className="treatment-card" key={treatment.image}>
          <a className="treatment-booking" href={treatmentBookingLinks[index]} target="_blank" rel="noreferrer" aria-label={`Book ${treatment.title}${details ? `, starting at $${price}` : ''}`}>{content}</a>
        </article>
      })}
    </section>
  </>
}
