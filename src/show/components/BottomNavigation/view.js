//TODO refactor after branding
import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View } from 'react-native';

import { Menu } from '/show/resources/images';
import { RowView } from '/show/containers';
import { Text } from '/show/components';

import styles from './style';

const BottomNavigation = (props) => {
  const { updateProps } = props;
  return (
    <View style={styles.container}>
      <RowView justifyContent={'space-between'}>
        <Menu onPress={() => updateProps({ sideBarOpen: true })} />

        <View style={styles.upNext}>
          <TouchableOpacity>
            {/* branding */}
            <Text.Callout color={'#525F6B'}>Up Next</Text.Callout>
          </TouchableOpacity>
        </View>

        <RowView width={44} height={44} />
      </RowView>
    </View>
  );
};

BottomNavigation.propTypes = {
  updateProps: PropTypes.func
};

export default BottomNavigation;
