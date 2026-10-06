import type { CSSProperties } from 'react'
import { Button } from './ui/button'

const BOOKING = 'https://miellewellness.noterro.com/'

const skinTreatments = [
  {
    title: 'The Total Acne & Scar Journey',
    image: 'services/skin-treatment/total-acne-scar-journey.jpg',
    width: 4579, height: 2576,
    alt: 'A professional performing a facial extraction on a client’s chin',
  },
  {
    title: 'The Deep Pigment & Sun Damage',
    image: 'services/skin-treatment/deep-pigment.jpg',
    width: 6720, height: 4480,
    alt: 'Amber skincare bottles beside dried leaves and flowers',
  },
  {
    title: 'Clinical Body Treatments',
    image: 'services/skin-treatment/clinical-body-treatments.jpg',
    width: 4928, height: 3264,
    alt: 'A clear serum bottle and glass dropper',
  },
  {
    title: 'Facial and Clinical Peels',
    image: 'services/skin-treatment/facial-and-clinical.jpg',
    width: 6000, height: 4000,
    alt: 'A professional applying a facial mask with a brush',
  },
  {
    title: 'Same-Day Technology Super Sessions',
    image: 'services/skin-treatment/same-day-technology.jpg',
    width: 5560, height: 3699,
    alt: 'A client’s face viewed through a magnifying treatment lamp',
  },
  {
    title: 'Ultimate Skin Rejuvenation Journey',
    image: 'services/skin-treatment/ultimate-skin.jpg',
    width: 6720, height: 4480,
    alt: 'A professional using a blue-lit facial treatment device',
  },
  {
    title: 'Laser Hair Removal',
    image: 'services/skin-treatment/laser-hair-removal.jpg',
    width: 4000, height: 2667,
    alt: 'A professional performing laser hair removal on a client’s legs',
  },
  {
    title: 'Free Personalized Treatment Assessment',
    image: 'services/skin-treatment/fre-personalized.jpg',
    width: 6000, height: 4000,
    alt: 'A bright treatment room with a treatment table and examination lamps',
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
            <img src={`/assets/${treatment.image}`} alt={treatment.alt} width={treatment.width} height={treatment.height} loading={index < 3 ? 'eager' : 'lazy'} />
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
