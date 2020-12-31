import React from 'react';
import PropTypes from 'prop-types';

import Text from 'Components/Text';
import { RowView } from 'Containers';
import { colors, defaults } from 'Theme';

const ListHeader = (props) => {
  const { title } = props;

  return (
    <RowView
      backgroundColor={colors.neutral}
      justifyContent={'flex-start'}
      alignItems={'flex-end'}
      marginHorizontal={defaults.marginHorizontal}
      width={'auto'}
      height={Text.Label.height + defaults.marginVertical}>
      <Text.Label color={colors.inputDark}>{title}</Text.Label>
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
