//testID supported
import React from 'react';
import PropTypes from 'prop-types';

import Text from 'Components/Text';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';

const Label = props => {
  const { backgroundColor, color, testID, text } = props;

  return (
    <RowView
      borderRadius={defaults.borderRadius / 2}
      backgroundColor={backgroundColor}
      height={Text.Label.height + defaults.marginVertical / 4}
      paddingHorizontal={defaults.marginHorizontal / 4}
      shadow
      width={'auto'}>
      <Text.Label color={color} testID={testID}>
        {text}
      </Text.Label>
    </RowView>
  );
};

Label.propTypes = {
  backgroundColor: PropTypes.any,
  color: PropTypes.any,
  shadow: PropTypes.bool,
  testID: PropTypes.string,
  text: PropTypes.string
};

Label.defaultProps = {
  backgroundColor: colors.error,
  color: colors.white,
  shadow: false,
  text: null
};

Label.height = Text.Label.height;
export default Label;
