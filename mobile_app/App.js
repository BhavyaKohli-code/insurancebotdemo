import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';


import GetStartedScreen from './src/screens/GetStartedScreen';
import HomeScreen from './src/screens/HomeScreen';
import LeavePolicyScreen from './src/screens/LeavePolicyScreen';
import SalesPolicyScreen from './src/screens/SalesPolicyScreen';
import SalesTargetScreen from './src/screens/SalesTargetScreen';
import HistoricalDataScreen from './src/screens/HistoricalDataScreen';
import TrainingDocumentScreen from './src/screens/TrainingDocumentScreen';
import ClaimStatusScreen from './src/screens/ClaimStatusScreen';
import { MENU_ITEMS } from './src/menu';

const Stack = createNativeStackNavigator();

const FEATURE_SCREENS = {
  LeavePolicy: LeavePolicyScreen,
  SalesPolicy: SalesPolicyScreen,
  SalesTarget: SalesTargetScreen,
  HistoricalData: HistoricalDataScreen,
  TrainingDocument: TrainingDocumentScreen,
  ClaimStatus: ClaimStatusScreen,
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="GetStarted">
          <Stack.Screen
            name="GetStarted"
            component={GetStartedScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

          {MENU_ITEMS.map((item) => (
            <Stack.Screen
              key={item.key}
              name={item.key}
              component={FEATURE_SCREENS[item.key]}
              options={{
                title: item.title,
                headerStyle: { backgroundColor: item.color },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '700' },
              }}
            />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
