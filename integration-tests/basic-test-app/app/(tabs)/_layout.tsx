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
          title: "EMBRACE OTLP TESTING",
          tabBarAccessibilityLabel: "EMBRACE OTLP TESTING",
        }}
      />
      <Tabs.Screen
        name="network-span-forwarding"
        options={{
          title: "EMBRACE NSF TESTING",
          tabBarAccessibilityLabel: "EMBRACE NSF TESTING",
        }}
      />
    </Tabs>
  );
}
