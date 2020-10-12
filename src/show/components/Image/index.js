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
    width,
    ...otherProps
  } = props;

  const [loading, setLoading] = useState(false);
  const [reloaded, setReloaded] = useState(false);
  const [ratio, setRatio] = useState(1);

  const imageSource = () => {
    const headers = {
      Authorization: `Bearer ${Api.getToken()}`
    };

    return source && source.uri
      ? {
          ...source,
          headers: requiresAuthentication ? headers : {}
        }
      : { ...fallbackSource, headers: requiresAuthentication ? headers : {} };
  };

  RNImage.getSizeWithHeaders(
    imageSource().uri,
    imageSource().headers,
    (w, h) => {
      setRatio(w / h);
    }
  );

  return (
    <View
      style={[
        style,
        styles.noBorder,
        width && { width: width, height: width / ratio }
      ]}>
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
  style: PropTypes.any,
  width: PropTypes.number
};

Image.defaultProps = {
  requiresAuthentication: false,
  width: null
};

export default Image;
