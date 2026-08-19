import FeatureScreen from '../components/FeatureScreen';

export default function HistoricalDataScreen() {
  return (
    <FeatureScreen
      color="#8E24AA"
      icon="📊"
      title="Historical Data"
      subtitle="Past performance across products, regions and quarters."
      points={[
        'FY 2023-24 gross written premium: ₹1,62,00,000.',
        'FY 2024-25 gross written premium: ₹1,94,00,000 (+19.8%).',
        'Best quarter on record: Q4 FY 2024-25.',
        'Claims ratio trend improved from 68% to 61%.',
        'North region contributed 41% of total premium.',
      ]}
    />
  );
}
