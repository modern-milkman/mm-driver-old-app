import React from 'react';
import PropTypes from 'prop-types';

import { defaults } from 'Theme';
import Text from 'Components/Text';
import { RowView, useTheme } from 'Containers';

const ListHeader = props => {
  const { title } = props;
  const { colors } = useTheme();

  return (
    <RowView
      backgroundColor={colors.neutral}
      justifyContent={'flex-start'}
      alignItems={'flex-end'}
      marginHorizontal={defaults.marginHorizontal}
      width={'auto'}
      height={Text.Label.height + defaults.marginVertical}>
      <Text.Label color={colors.inputSecondary}>{title}</Text.Label>
    </RowView>
  );
};

ListHeader.propTypes = {
  title: PropTypes.string
};

ListHeader.defaultProps = {
  title: ''
};

export default ListHeader;
