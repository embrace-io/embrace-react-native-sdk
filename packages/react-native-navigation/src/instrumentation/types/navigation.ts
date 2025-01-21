import {Navigation} from "react-native-navigation";
import {useNavigationContainerRef as useReactNativeNavigationExpoContainerRef} from "expo-router";
import {useNavigationContainerRef as useReactNativeNavigationContainerRef} from "@react-navigation/native";
import {Attributes, TracerOptions} from "@opentelemetry/api";

export type INativeNavigationContainer = ReturnType<typeof Navigation.events>;

export type INavigationContainer =
  | ReturnType<typeof useReactNativeNavigationContainerRef>
  | ReturnType<typeof useReactNativeNavigationExpoContainerRef>["current"];

export interface NavigationTrackerConfig {
  attributes?: Attributes;
  tracerOptions?: TracerOptions;
  debug?: boolean; // enabling `debug` mode will print console messages (info and warns). useful for debugging
}
