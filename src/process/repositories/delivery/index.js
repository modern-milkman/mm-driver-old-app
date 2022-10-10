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
      fromUrl: `/Claim/DriverResponseImageFile/${id}`,
      toFile: `${RNFS.DocumentDirectoryPath}/${Config.FS_DRIVER_REPLY_IMAGES}/${id}`
    });
  },
  getForDriver() {
    return Api.get(`${Api.DELIVERY_URL()}/Delivery/GetForDriver`);
  },
  getProductImage(id) {
    Api.repositories.filesystem.downloadFile({
      fromUrl: `/Product/Image/${id}`,
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
    routeId,
    driverId,
    orderId,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null,
    emptiesCollected = false,
    podImage = null,
    podImageType = null
  }) {
    return Api.post(`${Api.DELIVERY_URL()}/Delivery/${orderId}/SetDelivered`, {
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
    });
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
