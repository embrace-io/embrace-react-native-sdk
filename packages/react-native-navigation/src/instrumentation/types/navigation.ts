import {Navigation} from "react-native-navigation";
import {ReactNode} from "react";
import {useNavigationContainerRef as useReactNativeNavigationExpoContainerRef} from "expo-router";
import {useNavigationContainerRef as useReactNativeNavigationContainerRef} from "@react-navigation/native";
import {Attributes, TracerOptions, TracerProvider} from "@opentelemetry/api";

export type INativeNavigationContainer = ReturnType<typeof Navigation.events>;

export type INavigationContainer =
  | ReturnType<typeof useReactNativeNavigationContainerRef>
  | ReturnType<typeof useReactNativeNavigationExpoContainerRef>["current"];

export interface TrackerConfig {
  attributes?: Attributes;
  tracerOptions?: TracerOptions;
  debug?: boolean; // enabling `debug` mode will print console messages (info and warns). useful for debugging
}

export interface TrackerProps {
  children: ReactNode;
  // selected provider, should be configured by the app consumer
  provider?: TracerProvider;
  config?: TrackerConfig;
}
