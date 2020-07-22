//TODO refactor after branding
import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

import { Menu } from 'Images';
import { RowView } from 'Containers';

import style from './style';

const Navigation = (props) => {
  const { paddingBottom, panY, updateProps } = props;
  return (
    <Animated.View
      style={[
        style.container,
        { paddingBottom, transform: [{ translateY: panY }] }
      ]}>
      <RowView justifyContent={'space-between'}>
        <Menu onPress={() => updateProps({ sideBarOpen: true })} />

        <RowView width={44} height={44} />

        <RowView width={44} height={44} />
      </RowView>
    </Animated.View>
  );
};

Navigation.defaultProps = {
  panY: new Animated.Value(0)
};

Navigation.propTypes = {
  paddingBottom: PropTypes.number,
  panY: PropTypes.object,
  updateProps: PropTypes.func
};

export default Navigation;
