// import { WebView } from "react-native-webview";
// import { logEmbraceWebView } from "@embrace-io/react-native-webview-tracker";
import { StyleSheet } from "react-native";

// interface IWebViewScreen {
//   visible: boolean;
//   closePopup: () => void;
// }
// const WebViewScreen = ({ visible, closePopup }: IWebViewScreen) => {
const WebViewScreen = () => {
  return null;
  // <Modal transparent visible={visible}>
  //   <View style={styles.container}>
  //     <View style={styles.parent}>
  //       <View>
  //         <Text style={styles.title}>WebView</Text>
  //       </View>
  //       <View style={styles.webviewContainer}>
  //         {/* <WebView
  //           style={styles.webview}
  //           source={{ uri: "https://dev.embrace.io/" }}
  //           onMessage={(message) => {
  //             logEmbraceWebView("MyWebView", message);
  //           }}
  //         /> */}
  //       </View>
  //       <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
  //         <Text style={styles.closeButtonText}>Close</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // </Modal>
};

export default WebViewScreen;
const styles = StyleSheet.create({
  title: {
    width: "100%",
    backgroundColor: "rgba(44, 62, 80, 1)",
    textAlign: "center",
    color: "white",
    fontWeight: "600",
    fontSize: 20,
  },
  webviewContainer: {
    width: 300,
    height: 450,
  },
  webview: { flex: 0.8 },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "green",
  },
  parent: {
    borderColor: "rgba(44, 62, 80, 1)",
    borderWidth: 3,
  },
});
