import { Redirect } from 'expo-router';

// Entry point — redirect to dashboard or onboarding based on setup state
// TODO Slice 4: check Supabase auth + persona setup state
export default function Index() {
  return <Redirect href="/(tabs)/dashboard" />;
}
