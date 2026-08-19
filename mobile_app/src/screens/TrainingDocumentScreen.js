import FeatureScreen from '../components/FeatureScreen';

export default function TrainingDocumentScreen() {
  return (
    <FeatureScreen
      color="#00897B"
      icon="📚"
      title="Training Documents"
      subtitle="Onboarding material, product guides and compliance modules."
      points={[
        'New Agent Onboarding Handbook (v4.2).',
        'Product Guide: Health, Motor and Term Life.',
        'IRDAI Compliance & Ethics refresher — mandatory yearly.',
        'Objection Handling Playbook with call scripts.',
        'Digital Tools: quoting portal and CRM walkthrough.',
      ]}
    />
  );
}
