import {Tabs} from "expo-router";
import React from "react";

import {TabBarIcon} from "@/components/navigation/TabBarIcon";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarAccessibilityLabel: "HOME",
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="second"
        options={{
          title: "SECOND SCREEN",
          tabBarAccessibilityLabel: "SECOND SCREEN",
          tabBarIcon: ({color, focused}) => (
            <TabBarIcon name={"radio"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
