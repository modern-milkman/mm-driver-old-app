import Api from 'Api';
import { Platform } from 'react-native';
import Config from 'react-native-config';
import ImgToBase64 from 'react-native-image-base64';

export default {
  driverReply({ claimId, comment, image, imageType }) {
    return Api.post('/Claim/DriverResponse', {
      claimId,
      comment,
      image,
      imageType
    });
  },
  getCustomerAddressImage({ customerId, addressId }) {
    return Api.get(`/Customer/CustomerImage/${customerId}/${addressId}`);
  },
  getCustomerClaims({ customerId }) {
    return Api.get(`/Claim/GetDriverClaims/${customerId}`);
  },
  getDriverResponseImage({ id }) {
    return Api.get(`/Claim/DriverResponseImage/${id}`);
  },
  getForDriver() {
    return Api.get('/Delivery/GetForDriver');
  },
  getProductImage(id) {
    return ImgToBase64.getBase64String(
      `${Config.SERVER_URL}${Config.SERVER_URL_BASE}/Product/Image/${id}`,
      Api.getToken(),
      Platform.select({ ios: 0.1, android: 10 }) //Comperss ratio; For more info: react-native-image-base64
    );
  },
  getProductsOrder() {
    return Api.get('/Product/GetProductOrder');
  },
  getReasons() {
    return Api.get('/RejectReason');
  },
  getVehicleChecks() {
    return Api.get('/Driver/VehicleCheck');
  },
  getVehicleStockForDriver() {
    return Api.get('/Delivery/GetVehicleStockForDriver');
  },
  patchDelivered({
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
    reasonId,
    description,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null
  }) {
    return Api.patch('/Delivery/SetRejected', {
      orderId,
      reasonType: reasonId,
      description,
      deliveryLocationLatitude,
      deliveryLocationLongitude
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
