import React from 'react';
import PropTypes from 'prop-types';

import Text from 'Components/Text';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';

const Label = (props) => {
  const { backgroundColor, color, text } = props;

  return (
    <RowView
      width={'auto'}
      height={Text.Label.height + defaults.marginVertical / 4}
      paddingHorizontal={defaults.marginHorizontal / 4}
      borderRadius={defaults.borderRadius / 2}
      backgroundColor={backgroundColor}>
      <Text.Label color={color}>{text}</Text.Label>
    </RowView>
  );
};

Label.propTypes = {
  backgroundColor: PropTypes.any,
  color: PropTypes.any,
  text: PropTypes.string
};

Label.defaultProps = {
  backgroundColor: colors.error,
  color: colors.white,
  text: null
};

export default Label;
