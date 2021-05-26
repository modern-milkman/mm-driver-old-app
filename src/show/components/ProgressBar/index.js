//testID supported
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { colors } from 'Theme';
import { RowView } from 'Containers';
import Separator from 'Components/Separator';

import style from './style';

const ProgressBar = props => {
  const { height, progress, testID, total } = props;

  return (
    <RowView flex={1} testID={testID}>
      <View
        style={[
          style.progressWrapper,
          { width: (progress / total) * 100 + '%', height: height }
        ]}>
        <Separator
          borderRadius={4}
          color={colors.primary}
          height={height}
          width={'100%'}
        />
      </View>
      <Separator
        borderRadius={4}
        color={colors.input}
        height={height}
        width={'100%'}
      />
    </RowView>
  );
};

ProgressBar.propTypes = {
  height: PropTypes.number,
  progress: PropTypes.number,
  testID: PropTypes.string,
  total: PropTypes.number
};

ProgressBar.defaultProps = {
  height: 1,
  progress: 0,
  total: 1
};

export default ProgressBar;
