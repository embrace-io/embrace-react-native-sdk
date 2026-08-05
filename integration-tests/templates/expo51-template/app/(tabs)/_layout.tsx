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
        name="user"
        options={{
          title: "user",
          tabBarAccessibilityLabel: "USER TESTING",
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: "network",
          tabBarAccessibilityLabel: "NETWORK TESTING",
        }}
      />
      <Tabs.Screen
        name="redux"
        options={{
          title: "redux",
          tabBarAccessibilityLabel: "REDUX TESTING",
        }}
      />
    </Tabs>
  );
}
