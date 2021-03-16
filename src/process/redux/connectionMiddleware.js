import NetInfo from '@react-native-community/netinfo';

export default ({ dispatch }) => {
  let triggered = false;

  return (next) => (action) => {
    next(action);

    if (!triggered) {
      triggered = true;

      const handle = (netStatProps) =>
        dispatch({ type: 'REDUX_SAGA_NETSTAT_CHANGE', netStatProps });
      NetInfo.fetch().done(handle);
      NetInfo.addEventListener(handle);
      // https://github.com/react-native-netinfo/react-native-netinfo#usage
    }
  };
};
