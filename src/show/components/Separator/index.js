import React from 'react';
import PropTypes from 'prop-types';

import { RowView } from 'Containers';
import { colors } from 'Theme';

const Separator = (props) => {
  let height, width;
  if (props.vertical) {
    width = props.width ? props.width : 1;
    height = props.height ? props.height : 'auto';
  } else {
    width = props.width ? props.width : 'auto';
    height = props.height ? props.height : 1;
  }

  return (
    <RowView
      width={width}
      marginLeft={props.marginLeft}
      marginRight={props.marginRight}
      height={height}
      flex={props.flex}
      backgroundColor={props.color || colors.secondary}
    />
  );
};

Separator.propTypes = {
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  vertical: PropTypes.bool,
  color: PropTypes.any,
  flex: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number
};

Separator.defaultProps = {
  marginLeft: 15,
  marginRight: 15,
  vertical: false,
  flex: undefined
};

export default Separator;
