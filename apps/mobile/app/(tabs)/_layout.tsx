import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#A855F7',
        tabBarStyle: { backgroundColor: '#0D0D0D', borderTopColor: '#1a1a1a' },
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Ghost', tabBarIcon: () => null }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox', tabBarIcon: () => null }} />
      <Tabs.Screen name="train" options={{ title: 'Train', tabBarIcon: () => null }} />
      <Tabs.Screen name="rules" options={{ title: 'Rules', tabBarIcon: () => null }} />
    </Tabs>
  );
}
