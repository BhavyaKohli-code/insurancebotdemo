import FeatureScreen from '../components/FeatureScreen';

export default function SalesTargetScreen() {
  return (
    <FeatureScreen
      color="#FB8C00"
      icon="🎯"
      title="Sales Target"
      subtitle="Your current quarter goals and progress at a glance."
      points={[
        'Quarter target: ₹45,00,000 gross written premium.',
        'Achieved so far: ₹28,60,000 (63% of target).',
        'New policies issued: 142 of 220.',
        'Renewal retention: 88% against a goal of 90%.',
        'Top performing product: Term Life Secure Plus.',
      ]}
    />
  );
}
