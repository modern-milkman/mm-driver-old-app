//testID supported
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import React, { useEffect, useState } from 'react';
import { View, Image as RNImage, ActivityIndicator } from 'react-native';

import Api from 'Api';

import styles from './style';

const Image = props => {
  const {
    maxHeight,
    renderFallback,
    requiresAuthentication,
    source,
    style,
    testID,
    width,
    ...otherProps
  } = props;

  const [loading, setLoading] = useState(false);
  const [rendersError, setRendersError] = useState(false);
  const [ratio, setRatio] = useState(1);

  const imageSource = () => {
    if (
      source &&
      source.uri &&
      typeof source.uri === 'string' &&
      source?.uri.includes('base64')
    ) {
      return { ...source };
    }

    const headers = {
      Authorization: `Bearer ${Api.getToken()}`,
      'x-api-version': Config.X_API_VERSION
    };

    return source && source.uri
      ? {
          ...source,
          headers: requiresAuthentication ? headers : {}
        }
      : null;
  };

  RNImage.getSizeWithHeaders(
    imageSource().uri,
    imageSource().headers,
    (w, h) => {
      setRatio(w / h);
    },
    e => {
      setRatio(1);
    }
  );

  let computedHeight = width / ratio;
  let computedWidth = width;

  if (computedHeight > maxHeight) {
    computedHeight = maxHeight;
    computedWidth = computedHeight * ratio;
  }

  useEffect(() => {
    if (rendersError) {
      setLoading(false);
    }
  }, [rendersError]);

  return (
    <View
      style={[
        style,
        styles.noBorder,
        width && { width: computedWidth, height: computedHeight }
      ]}>
      {rendersError ? (
        renderFallback ? (
          renderFallback()
        ) : null
      ) : (
        <RNImage
          {...otherProps}
          source={imageSource()}
          onError={setRendersError.bind(null, true)}
          onLoadStart={setLoading.bind(null, true)}
          onLoadEnd={setLoading.bind(null, false)}
          style={[
            style,
            width && { width: computedWidth, height: computedHeight }
          ]}
          testID={testID}
        />
      )}

      {loading && (
        <ActivityIndicator style={styles.activityIndicator} size="small" />
      )}
    </View>
  );
};

Image.propTypes = {
  maxHeight: PropTypes.number,
  requiresAuthentication: PropTypes.bool,
  renderFallback: PropTypes.func,
  source: PropTypes.any,
  style: PropTypes.any,
  testID: PropTypes.string,
  width: PropTypes.number
};

Image.defaultProps = {
  requiresAuthentication: false,
  width: null,
  source: ''
};

export default Image;
