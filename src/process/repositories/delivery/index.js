import RNFS from 'react-native-fs';
import Config from 'react-native-config';

import Api from 'Api';

export default {
  driverReply({ claimId, comment, image, imageType }) {
    return Api.post('/Claim/DriverResponse', {
      claimId,
      comment,
      image,
      imageType
    });
  },
  getCannedContent() {
    return Api.get('/CannedContent/GetByContentType/2');
  },
  getCustomerClaims({ customerId }) {
    return Api.get(`/Claim/GetDriverClaims/${customerId}`);
  },
  getDriverResponseImage(id) {
    Api.repositories.filesystem.downloadFile({
      fromUrl: `${Api.S_URL()}${
        Config.S_URL_BASE
      }/Claim/DriverResponseImageFile/${id}`,
      toFile: `${RNFS.DocumentDirectoryPath}/${Config.FS_DRIVER_REPLY_IMAGES}/${id}`
    });
  },
  getForDriver() {
    return Api.get(
      `${Api.SS_URL()}${Api.SS_URL_BASE('delivery')}/Delivery/GetForDriver`
    );
  },
  getProductImage(id) {
    Api.repositories.filesystem.downloadFile({
      fromUrl: `${Api.S_URL()}${Config.S_URL_BASE}/Product/Image/${id}`,
      toFile: `${RNFS.DocumentDirectoryPath}/${Config.FS_PROD_IMAGES}/${id}`
    });
  },
  getAllBundleProducts() {
    return Api.get('/Product/GetAllBundleProducts');
  },
  getReasons() {
    return Api.get('/RejectReason');
  },
  getReturnTypes() {
    return Api.get('/ReturnType');
  },
  getVehicleStockForDriver() {
    return Api.get('/Delivery/GetVehicleStockForDriver');
  },
  patchFRDelivered({
    orderId,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null
  }) {
    return Api.patch('/Delivery/SetDelivered', {
      orderId,
      deliveryLocationLatitude,
      deliveryLocationLongitude
    });
  },
  patchItemOutOfStock(itemId) {
    return Api.patch(`/Delivery/SetOutfStock/${itemId}`);
  },
  patchRejected({
    orderId,
    reasonType,
    description,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null
  }) {
    return Api.patch('/Delivery/SetRejected', {
      orderId,
      reasonType,
      description,
      deliveryLocationLatitude,
      deliveryLocationLongitude
    });
  },
  postDelivered({
    orderId,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null,
    podImage = null,
    podImageType = null
  }) {
    return Api.post(
      `${Api.SS_URL()}${Api.SS_URL_BASE(
        'delivery'
      )}/Delivery/${orderId}/SetDelivered`,
      {
        deliveryLocationLatitude,
        deliveryLocationLongitude,
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
    return Api.post('/Driver/DriverActivity', {
      ...payload
    });
  },
  postVechicleChecks({ payload }) {
    return Api.post('/Driver/VehicleCheck', {
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
