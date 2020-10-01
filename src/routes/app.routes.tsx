import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Dashboard from '../pages/Dashboard';

const Auth = createStackNavigator();

const AppRoutes: React.FC = () => (
  <Auth.Navigator
    screenOptions={{
      headerShown: true,
      cardStyle: { backgroundColor: '#312e28' },
    }}

  >
    <Auth.Screen name="Dashboard" component={Dashboard} />

  </Auth.Navigator>
);

export default AppRoutes;
