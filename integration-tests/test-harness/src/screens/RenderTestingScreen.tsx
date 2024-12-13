import * as React from "react";
import {Button, View, Text} from "react-native";
import {useCallback} from "react";
import {styles} from "../helpers/styles";

const SubErrorComponent2 = () => {
  throw new TypeError("Upssssssss");
};

const SubErrorComponent1 = () => {
  return (
    <View>
      <SubErrorComponent2 />
    </View>
  );
};

const ErrorComponent = () => {
  return (
    <View>
      <SubErrorComponent1 />
    </View>
  );
};

const RenderTestingScreen = () => {
  const [isError, setIsError] = React.useState(false);
  const handleRenderError = useCallback(() => {
    setIsError(true);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Render</Text>
        <Button onPress={handleRenderError} title="Trigger a Render error" />
      </View>

      {isError && <ErrorComponent />}
    </View>
  );
};

export {RenderTestingScreen};
