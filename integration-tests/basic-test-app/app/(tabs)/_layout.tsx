import {Tabs} from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "LOG TESTING",
          tabBarAccessibilityLabel: "LOG TESTING",
        }}
      />
      <Tabs.Screen
        name="tracer-provider"
        options={{
          title: "TRACER PROVIDER TESTING",
          tabBarAccessibilityLabel: "TRACER PROVIDER TESTING",
        }}
      />
      <Tabs.Screen
        name="react-native-otlp"
        options={{
          title: "EMBRACE OTLP",
          tabBarAccessibilityLabel: "EMBRACE OTLP",
        }}
      />
    </Tabs>
  );
}
