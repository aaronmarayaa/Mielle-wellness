type Insurer = string[]

const preferredOrder = [
  'Canada Life',
  'Manulife',
  'Alberta Blue Cross',
  'Sun Life',
  'Manitoba Blue Cross',
  'ClaimSecure',
  'Desjardins',
  'Johnson',
  'Beneva',
  'Johnston Group',
  'The PBAS Group',
]

function orderInsurers(insurers: readonly Insurer[]) {
  const priority = new Map(preferredOrder.map((name, index) => [name.toLowerCase(), index]))
  return [...insurers].sort((a, b) => {
    const ai = priority.get(a[1].toLowerCase()) ?? 999
    const bi = priority.get(b[1].toLowerCase()) ?? 999
    return ai - bi
  })
}

export function DirectBillingPage({ insurers }: { insurers: readonly Insurer[] }) {
  const ordered = orderInsurers(insurers)

  return <div className="direct-billing-page">
    <section className="direct-billing-hero" aria-labelledby="direct-billing-title">
      <img src="/assets/direct-billing-hero.jpg" alt="Hot stone massage treatment" />
      <div className="direct-billing-hero-overlay" />
      <div className="direct-billing-hero-copy">
        <h1 id="direct-billing-title">DIRECT BILLING</h1>
        <p>Stress-Free Direct Billing For Eligible Insurance</p>
      </div>
    </section>

    <section className="direct-billing-providers" aria-label="Direct billing insurance providers">
      <div className="direct-billing-logo-grid">
        {ordered.map(([file, name]) => <div className="direct-billing-logo" key={file}>
          <img src={`/assets/insurer-${file}`} alt={name} loading="lazy" />
        </div>)}
      </div>
    </section>
  </div>
}
