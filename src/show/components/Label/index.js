//testID supported
import React from 'react';
import PropTypes from 'prop-types';

import Text from 'Components/Text';
import { RowView, useTheme } from 'Containers';
import { defaults } from 'Theme';

const Label = props => {
  const { backgroundColor, color, height, testID, text } = props;
  const { colors } = useTheme();

  return (
    <RowView
      borderRadius={defaults.borderRadius / 2}
      backgroundColor={backgroundColor || colors.error}
      height={height}
      paddingHorizontal={defaults.marginHorizontal / 4}
      shadow
      width={'auto'}>
      <Text.Label color={color || colors.white} testID={testID}>
        {text}
      </Text.Label>
    </RowView>
  );
};

Label.propTypes = {
  backgroundColor: PropTypes.any,
  color: PropTypes.any,
  height: PropTypes.number,
  shadow: PropTypes.bool,
  testID: PropTypes.string,
  text: PropTypes.string
};

Label.defaultProps = {
  height: Text.Label.height + defaults.marginVertical / 4,
  shadow: false,
  text: null
};

Label.height = Text.Label.height;
export default Label;
