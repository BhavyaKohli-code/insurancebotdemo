import FeatureScreen from '../components/FeatureScreen';

export default function LeavePolicyScreen() {
  return (
    <FeatureScreen
      color="#1E88E5"
      icon="🗓️"
      title="Leave Policy"
      subtitle="Entitlements, approvals and holiday rules for all employees."
      points={[
        '24 paid leaves per calendar year, credited quarterly.',
        '12 casual leaves and 8 sick leaves, non-carry-forward.',
        'Apply at least 3 working days in advance for planned leave.',
        'Approvals are routed to your reporting manager automatically.',
        'Unused paid leave up to 10 days can be encashed in March.',
      ]}
    />
  );
}
