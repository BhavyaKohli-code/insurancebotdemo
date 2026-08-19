import FeatureScreen from '../components/FeatureScreen';

export default function SalesPolicyScreen() {
  return (
    <FeatureScreen
      color="#43A047"
      icon="📄"
      title="Sales Policy"
      subtitle="Rules of engagement for quoting, discounting and closing business."
      points={[
        'All quotes must be generated from the approved rate card.',
        'Discounts above 10% need regional manager sign-off.',
        'Customer KYC must be completed before policy issuance.',
        'Commission is released after the first premium is realised.',
        'Mis-selling complaints trigger an immediate clawback review.',
      ]}
    />
  );
}
