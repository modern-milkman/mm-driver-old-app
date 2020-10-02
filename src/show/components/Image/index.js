import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { View, Image as RNImage, ActivityIndicator } from 'react-native';

import Api from 'Api';

import styles from './style';

const Image = (props) => {
  const {
    fallbackSource,
    requiresAuthentication,
    source,
    style,
    ...otherProps
  } = props;

  const [loading, setLoading] = useState(false);
  const [reloaded, setReloaded] = useState(false);

  const imageSource = () => {
    const headers = {
      Authorization: Api.getToken()
    };

    return source && source.uri
      ? {
          ...source,
          headers: requiresAuthentication ? headers : {}
        }
      : { ...fallbackSource, headers: requiresAuthentication ? headers : {} };
  };

  return (
    <View style={[style, styles.noBorder]}>
      <RNImage
        {...otherProps}
        source={imageSource()}
        onError={!reloaded && setReloaded.bind(null, reloaded)}
        onLoadStart={setLoading.bind(null, true)}
        onLoadEnd={setLoading.bind(null, false)}
        style={style}
      />
      {loading && (
        <ActivityIndicator style={styles.activityIndicator} size="small" />
      )}
    </View>
  );
};

Image.propTypes = {
  fallbackSource: PropTypes.any,
  requiresAuthentication: PropTypes.bool,
  source: PropTypes.any,
  style: PropTypes.any
};

Image.defaultProps = {
  requiresAuthentication: false
};

export default Image;
