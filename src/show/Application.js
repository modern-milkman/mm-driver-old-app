import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import createStore from 'Redux/store';
import { Creators as StartupActions } from 'Reducers/application';

const { store, persistor } = createStore();

const initApp = () => {
  store.dispatch(StartupActions.init());
};

import ApplicationRootView from './ApplicationRootView';

class Application extends React.Component {
  render = () => (
    <SafeAreaProvider>
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={initApp()}>
          <ApplicationRootView />
        </PersistGate>
      </Provider>
    </SafeAreaProvider>
  );
}

export default Application;
