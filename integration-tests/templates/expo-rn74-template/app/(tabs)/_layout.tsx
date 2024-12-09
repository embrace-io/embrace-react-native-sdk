import {Tabs} from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "log",
          tabBarAccessibilityLabel: "LOG TESTING",
        }}
      />
      <Tabs.Screen
        name="span"
        options={{
          title: "span",
          tabBarAccessibilityLabel: "SPAN TESTING",
        }}
      />
      <Tabs.Screen
        name="prop"
        options={{
          title: "prop",
          tabBarAccessibilityLabel: "PROPERTY TESTING",
        }}
      />
      <Tabs.Screen
        name="tracer-provider"
        options={{
          title: "tracer",
          tabBarAccessibilityLabel: "TRACER PROVIDER TESTING",
        }}
      />
      <Tabs.Screen
        name="react-native-otlp"
        options={{
          title: "otlp",
          tabBarAccessibilityLabel: "EMBRACE OTLP",
        }}
      />
      <Tabs.Screen
        name="misc"
        options={{
          title: "misc",
          tabBarAccessibilityLabel: "MISC TESTING",
        }}
      />
    </Tabs>
  );
}
