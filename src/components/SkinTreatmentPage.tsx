import type { CSSProperties } from 'react'
import { Button } from './ui/button'

const BOOKING = 'https://miellewellness.noterro.com/'

const skinTreatments = [
  {
    title: 'The Total Acne & Scar Journey',
    image: 'skin-acne-scar.jpg',
    alt: 'A client receiving a professional facial skin treatment',
  },
  {
    title: 'The Deep Pigment & Sun Damage',
    image: 'skin-pigment-sun-damage.jpeg',
    alt: 'Professional peel treatment products displayed in water',
  },
  {
    title: 'Clinical Body Treatments',
    image: 'skin-clinical-body.jpg',
    alt: 'A professional peel treatment product beside a client treatment',
  },
  {
    title: 'Facial and Clinical Peels',
    image: 'skin-facial-peels.jpg',
    alt: 'A client receiving a professional facial peel treatment',
  },
  {
    title: 'Same-Day Technology Super Sessions',
    image: 'skin-super-sessions.jpg',
    alt: 'A client receiving an LED light facial treatment',
  },
  {
    title: 'Ultimate Skin Rejuvenation Journey',
    image: 'skin-rejuvenation.jpg',
    alt: 'A client receiving a technology-assisted skin rejuvenation treatment',
  },
  {
    title: 'Laser Hair Removal',
    image: 'skin-laser-hair.jpg',
    alt: 'A client receiving laser hair removal treatment',
  },
  {
    title: 'Free Personalized Treatment Assessment',
    image: 'skin-assessment.jpg',
    alt: 'A treatment room prepared for a personalized skin assessment',
  },
]

export function SkinTreatmentPage() {
  return <>
    <section className="skin-treatment-intro" aria-labelledby="skin-treatment-title">
      <h1 id="skin-treatment-title">RMN Aesthetic Studio</h1>
      <p>Mielle Wellness Facial, offers personalized aesthetic and skincare treatments customized to your needs. With licensed and certified expertise, we combine modern techniques with professional care to help you achieve healthy, natural-looking results.</p>
      <Button className="skin-treatment-booking" size="lg" asChild>
        <a href={BOOKING} target="_blank" rel="noreferrer">BOOK NOW</a>
      </Button>
      <h2>Available Services</h2>
    </section>

    <section className="skin-treatment-gallery" aria-label="Available skin treatment services">
      {skinTreatments.map((treatment, index) => <article className="skin-treatment-card" key={treatment.image} style={{ '--skin-delay': `${Math.min(index, 5) * 55 + 90}ms` } as CSSProperties}>
        <a className="skin-treatment-link" href={BOOKING} target="_blank" rel="noreferrer" aria-label={`Book ${treatment.title}`}>
          <span className="skin-treatment-image">
            <img src={`/assets/${treatment.image}`} alt={treatment.alt} width="720" height="720" loading={index < 3 ? 'eager' : 'lazy'} />
          </span>
          <h3>{treatment.title}</h3>
        </a>
      </article>)}
    </section>

    <div className="skin-treatment-cta">
      <Button className="skin-treatment-booking" size="lg" asChild>
        <a href={BOOKING} target="_blank" rel="noreferrer">BOOK YOUR APPOINTMENT</a>
      </Button>
    </div>
  </>
}
