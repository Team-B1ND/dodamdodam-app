import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Grid, DoorOpen, MoonPlus, Menu } from "@shared/icons/mono";
import { BottomTabBar } from "@widgets/bottom-tab-bar";
import { HomePage } from "@pages/home";
import { AidPage } from "@pages/aid";
import { OutSleepingPage } from "@pages/out-sleeping";
import { NightStudyPage } from "@pages/night-study";
import { MorePage } from "@pages/more";

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Aid"
        component={AidPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Grid size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OutSleeping"
        component={OutSleepingPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <DoorOpen size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NightStudy"
        component={NightStudyPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MoonPlus size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MorePage}
        options={{
          tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
