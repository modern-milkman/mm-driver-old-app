import { StyleSheet } from 'react-native';

import { deviceFrame } from 'Helpers';

const { height, width } = deviceFrame();

const style = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black', //branding TODO
    opacity: 0.5
  },
  modalWrapper: {
    backgroundColor: 'white',
    alignSelf: 'center',
    alignItems: 'center',
    width: width * 0.8,
    height: height * 0.7,
    top: height * 0.15,
    borderRadius: 14
  }
});

export default style;
