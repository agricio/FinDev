import React from 'react';
import { WebView } from 'react-native-webview';

function Profile({ navigation }){
    const guithubUsername = navigation.getParam('gitHub_username');
    return (
        <WebView  style={{ flex:1}} source={{ uri: `https://github.com/${guithubUsername}`}}  />
    )
}

export default Profile; 