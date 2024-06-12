import { useNavigation } from "@react-navigation/core";
import React, { useMemo } from "react";
import { View, NativeModules, Platform } from "react-native";

import ActionButton, { IAction } from "../components/ActionButton";
import ActionList from "../components/ActionList";

const { CrashTestModule } = NativeModules;

const NativeCrashes = () => {
  const navigation = useNavigation();

  const actions = useMemo(() => {
    const actions: IAction[] = [
      {
        id: "throw-c-crash",
        name: "C++ Crash",
        onPress: () => {
          console.log("CrashTestModule", CrashTestModule.generateCPPCrash);
          CrashTestModule.generateCPPCrash();
        },
        backgroundColor: "red",
      },
      {
        id: "throw-native-crash",
        name: "Native Crash",
        onPress: () => CrashTestModule.generateNativeCrash(),
        backgroundColor: "#7f0000",
      },
    ];
    switch (Platform.OS) {
      case "android":
        break;
      case "ios":
        actions.push({
          id: "throw-ios-crash",
          name: `NS`,
          onPress: () => CrashTestModule.generatePlatformCrash(),
          backgroundColor: "#7f0000",
        });
        break;
      default:
        console.log("Nothing else to test");
    }

    return actions;
  }, []);

  const handleOnNavigate = () => {
    const { navigate }: { navigate: (screenName: string) => void } = navigation;
    navigate("JsCrashes");
  };

  return (
    <View
      style={{
        flex: 1,
        marginTop: 10,
        paddingBottom: 50,
      }}
    >
      <ActionList actions={actions} />
      <View style={{ height: 100, flex: 0.2 }}>
        <ActionButton
          id="navigate-js-crashes"
          onPress={handleOnNavigate}
          name={"JS Crashes"}
          backgroundColor={"rgba(44, 62, 80, 1)"}
        />
      </View>
    </View>
  );
};

export default NativeCrashes;
