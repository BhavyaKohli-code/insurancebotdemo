import FeatureScreen from '../components/FeatureScreen';

export default function ClaimStatusScreen() {
  return (
    <FeatureScreen
      color="#E53935"
      icon="🛡️"
      title="Claim Status"
      subtitle="Track claims raised by your customers end to end."
      points={[
        'CLM-10241 — Motor — Surveyor assigned.',
        'CLM-10238 — Health — Documents pending from customer.',
        'CLM-10230 — Term Life — Under underwriting review.',
        'CLM-10219 — Motor — Approved, payout scheduled.',
        'Average settlement time this quarter: 9 days.',
      ]}
    />
  );
}
