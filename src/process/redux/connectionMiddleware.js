import Config from 'react-native-config';
import NetInfo from '@react-native-community/netinfo';

NetInfo.configure({
  reachabilityUrl:
    Config.SERVER_URL +
    Config.SERVER_URL_BASE +
    Config.NETINFO_REACHABILITY_URL,
  reachabilityLongTimeout: parseInt(Config.NETINFO_REACHABILITY_LONG_TIMEOUT),
  reachabilityShortTimeout: parseInt(Config.NETINFO_REACHABILITY_SHORT_TIMEOUT),
  reachabilityRequestTimeout: parseInt(
    Config.NETINFO_REACHABILITY_REQUEST_TIMEOUT
  ),
  reachabilityTest: async response => response.status === 200
});

export default ({ dispatch }) => {
  let triggered = false;

  return next => action => {
    next(action);

    if (!triggered) {
      triggered = true;

      const handle = netStatProps =>
        dispatch({ type: 'REDUX_SAGA_NETSTAT_CHANGE', netStatProps });

      NetInfo.fetch().done(handle);
      NetInfo.addEventListener(handle);
      // https://github.com/react-native-netinfo/react-native-netinfo#usage
    }
  };
};
