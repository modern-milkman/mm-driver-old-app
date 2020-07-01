import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import createStore from '/process/redux/store';
import { Creators as StartupActions } from '/process/reducers/application';

const { store, persistor } = createStore();

const initApp = () => {
  store.dispatch(StartupActions.init());
};

import ApplicationRootView from './ApplicationRootView';

class Application extends React.Component {
  render = () => (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
        onBeforeLift={initApp()}>
        <ApplicationRootView />
      </PersistGate>
    </Provider>
  );
}

export default Application;
