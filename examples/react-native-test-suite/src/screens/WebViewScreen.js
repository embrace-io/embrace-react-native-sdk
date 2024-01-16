import React from 'react';
import {WebView} from 'react-native-webview';
import {logEmbraceWebView} from '@embrace-io/webview-tracker';
import {Modal, View, Text, TouchableOpacity} from 'react-native';

const WebViewScreen = ({visible, closePopup}) => {
  return (
    <Modal transparent visible={visible}>
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}>
        <View
          style={{
            borderColor: 'rgba(44, 62, 80, 1)',
            borderWidth: 3,
          }}>
          <View>
            <Text
              style={{
                width: '100%',
                backgroundColor: 'rgba(44, 62, 80, 1)',
                textAlign: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: 20,
              }}>
              WebView
            </Text>
          </View>
          <View
            style={{
              width: 300,
              height: 450,
            }}>
            <WebView
              style={{flex: 0.8}}
              source={{uri: 'https://dev.embrace.io/'}}
              onMessage={message => {
                logEmbraceWebView('MyWebView', message);
              }}
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: 'green',
            }}
            onPress={() => {
              closePopup(false);
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                fontWeight: '600',
                textAlign: 'center',
              }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WebViewScreen;
