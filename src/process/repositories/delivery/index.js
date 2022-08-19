import RNFS from 'react-native-fs';
import Config from 'react-native-config';

import Api from 'Api';

export default {
  driverReply({ claimId, comment, image, imageType }) {
    return Api.post(`${Api.SS_URL_SUFFIX('admin')}/Claim/DriverResponse`, {
      claimId,
      comment,
      image,
      imageType
    });
  },
  getCannedContent() {
    return Api.get(
      `${Api.SS_URL_SUFFIX('admin')}/CannedContent/GetByContentType/2`
    );
  },
  getCustomerClaims({ customerId }) {
    return Api.get(
      `${Api.SS_URL_SUFFIX('admin')}/Claim/GetDriverClaims/${customerId}`
    );
  },
  getDriverResponseImage(id) {
    Api.repositories.filesystem.downloadFile({
      fromUrl: `${Api.S_URL()}${
        Api.S_URL_SUFFIX
      }/Claim/DriverResponseImageFile/${id}`,
      toFile: `${RNFS.DocumentDirectoryPath}/${Config.FS_DRIVER_REPLY_IMAGES}/${id}`
    });
  },
  getForDriver() {
    return Api.get(
      `${Api.SS_URL()}${Api.SS_URL_SUFFIX('delivery')}/Delivery/GetForDriver`
    );
  },
  getProductImage(id) {
    Api.repositories.filesystem.downloadFile({
      fromUrl: `${Api.S_URL()}${Api.S_URL_SUFFIX}/Product/Image/${id}`,
      toFile: `${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${id}`
    });
  },
  getAllBundleProducts() {
    return Api.get(
      `${Api.SS_URL_SUFFIX('admin')}/Product/GetAllBundleProducts`
    );
  },
  getReasons() {
    return Api.get(`${Api.SS_URL_SUFFIX('admin')}/RejectReason`);
  },
  getReturnTypes() {
    return Api.get(`${Api.SS_URL_SUFFIX('admin')}/ReturnType`);
  },
  getVehicleStockForDriver() {
    return Api.get(
      `${Api.SS_URL_SUFFIX('admin')}/Delivery/GetVehicleStockForDriver`
    );
  },
  patchItemOutOfStock(itemId) {
    return Api.patch(
      `${Api.SS_URL_SUFFIX('admin')}/Delivery/SetOutfStock/${itemId}`
    );
  },
  patchRejected({
    orderId,
    reasonType,
    description,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null
  }) {
    return Api.patch(`${Api.SS_URL_SUFFIX('admin')}/Delivery/SetRejected`, {
      orderId,
      reasonType,
      description,
      deliveryLocationLatitude,
      deliveryLocationLongitude
    });
  },
  postDelivered({
    routeId,
    driverId,
    orderId,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null,
    emptiesCollected = false,
    podImage = null,
    podImageType = null
  }) {
    return Api.post(
      `${Api.SS_URL()}${Api.SS_URL_SUFFIX(
        'delivery'
      )}/Delivery/${orderId}/SetDelivered`,
      {
        routeId,
        driverId,
        deliveryLocationLatitude,
        deliveryLocationLongitude,
        emptiesCollected,
        ...(podImage &&
          podImageType && {
            proofOfDelivery: {
              imageData: podImage,
              mimeType: podImageType
            }
          })
      }
    );
  },
  postDriverActivity(payload) {
    return Api.post(`${Api.SS_URL_SUFFIX('admin')}/Driver/DriverActivity`, {
      ...payload
    });
  },
  postVechicleChecks({ payload }) {
    return Api.post(`${Api.SS_URL_SUFFIX('admin')}/Driver/VehicleCheck`, {
      ...payload
    });
  },
  updateDirectionsPolyline({
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude
  }) {
    return Api.get(
      `/Routing/GetDirections/${originLatitude}/${originLongitude}/${destinationLatitude}/${destinationLongitude}`
    );
  }
};
