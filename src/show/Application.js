import React from 'react';
import { Provider } from 'react-redux';
import Braze from 'react-native-appboy-sdk';
import * as SplashScreen from 'expo-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import createStore from 'Redux/store';
import { ThemeProvider } from './containers';
import { Creators as StartupActions } from 'Reducers/application';

const { store, persistor } = createStore();

const initApp = () => {
  store.dispatch(StartupActions.init());
};

import ApplicationRootView from './ApplicationRootView';

class Application extends React.Component {
  componentDidMount = async () => {
    const permissionOptions = {
      alert: true,
      sound: true,
      badge: true,
      provisional: false
    };

    Braze.requestPushPermission(permissionOptions);
    await SplashScreen.preventAutoHideAsync();
  };

  render = () => (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={initApp()}>
          <ThemeProvider>
            <ApplicationRootView />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}

export default Application;
