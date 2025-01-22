import {EventsRegistry} from "react-native-navigation";
import {ReactNode} from "react";
import {EventConsumer, EventMapBase, Route} from "@react-navigation/native";
import {Attributes, TracerOptions, TracerProvider} from "@opentelemetry/api";

export type INativeNavigationContainer = Pick<
  EventsRegistry,
  "registerComponentDidDisappearListener" | "registerComponentDidAppearListener"
>;

export type INavigationContainer = Pick<
  EventConsumer<EventMapBase>,
  "addListener"
> & {getCurrentRoute: () => Route<string> | undefined};

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
