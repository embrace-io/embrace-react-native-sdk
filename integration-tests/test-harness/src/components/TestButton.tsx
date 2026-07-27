import * as React from "react";
import {Button, ButtonProps} from "react-native";

// Set the accessibility label explicitly to keep Appium's
// `~title` selectors working on every RN version.
const TestButton = ({title, ...rest}: ButtonProps) => (
  <Button title={title} accessibilityLabel={title} {...rest} />
);

export default TestButton;
