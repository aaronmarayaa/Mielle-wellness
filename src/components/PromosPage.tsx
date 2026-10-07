import { Button } from './ui/button'

const promotions = [
  {
    id: 'thanksgiving',
    title: 'THANKSGIVING DEALS',
    paragraphs: [
      'Celebrate Thanksgiving at Mielle Wellness with 10% off massage therapy, facial treatments and skin treatments.',
      'Plus a free pumpkin pie from Pie Junkie YYC!',
    ],
    image: 'promo-thanksgiving.png',
    width: 2080,
    height: 2080,
    alt: 'Mielle Wellness Thanksgiving Deals: 10% off massage therapy, facial treatments and skin treatments, plus a free pumpkin pie from Pie Junkie YYC.',
  },
  {
    id: 'seniors',
    title: 'COMPASSIONATE MASSAGE CARE FOR SENIORS',
    paragraphs: [
      'Bringing comfort, relief and relaxation right to your doorstep. Our mobile massage therapy is designed to support seniors with pain relief, improved mobility and overall wellness. Professional, caring and convenient in the comfort of home.',
    ],
    image: 'promo-seniors.png',
    width: 1103,
    height: 1426,
    alt: 'Mielle Wellness massage care for seniors: mobile massage services in the comfort of home. Call 825-407-8617.',
  },
  {
    id: 'first-visit',
    title: 'FIRST VISIT SPECIAL AT MIELLE WELLNESS',
    paragraphs: [
      'Step into relaxation and experience personalized wellness at Mielle Wellness.',
      'As a warm welcome, new clients receive 10% OFF their first visit. From therapeutic massage treatments to a calming self-care experience, we’re here to help you relax, recharge, and feel your best.',
    ],
    image: 'promo-first-visit.png',
    width: 1254,
    height: 1254,
    alt: 'A special welcome from Mielle Wellness: 10% off your first visit.',
  },
]

export function PromosPage() {
  return <>
    <section className="promos-hero" aria-labelledby="promos-title">
      <img src="/assets/promos-herbal-massage.jpeg" alt="" width="683" height="1024" fetchPriority="high" />
      <div className="promos-hero-copy">
        <h1 id="promos-title">PROMOS</h1>
        <p>Stay Updated with Our Promos &amp; Events</p>
      </div>
    </section>
    <div className="promotions">
      {promotions.map((promotion, index) => <section className="promotion" key={promotion.id} aria-labelledby={`promo-${promotion.id}`}>
        <div className="promotion-copy" data-reveal>
          <div className="promotion-heading"><span className="promotion-number" aria-hidden="true">0{index + 1}</span><h2 id={`promo-${promotion.id}`}>{promotion.title}</h2></div>
          {promotion.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <Button className="promotion-booking" size="lg" asChild><a href="/services">BOOK NOW</a></Button>
        </div>
        <div className="promotion-art" data-reveal><img src={`/assets/${promotion.image}`} alt={promotion.alt} width={promotion.width} height={promotion.height} loading="lazy" /></div>
      </section>)}
    </div>
  </>
}
