import Api from 'Api';
import Config from 'react-native-config';

export default {
  acknowledgeClaim({ id }) {
    return Api.post(`/Claim/Acknowledge/${id}`);
  },
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
  getProductsOrder() {
    return Api.get(Config.DEFAULT_PRODUCTS_ORDER_URL, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  getVehicleStockForDriver() {
    return Api.get('/Delivery/GetVehicleStockForDriver');
  },
  patchDelivered(
    orderId,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null
  ) {
    return Api.patch('/Delivery/SetDelivered', {
      orderId,
      deliveryLocationLatitude,
      deliveryLocationLongitude
    });
  },
  patchItemOutOfStock(itemId) {
    return Api.patch(`/Delivery/SetOutfStock/${itemId}`);
  },
  patchRejected(
    orderId,
    description,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null
  ) {
    return Api.patch('/Delivery/SetRejected', {
      orderId,
      reasonType: 3, //Reason Types are: WrongAddress = 1, PinWrong = 2, Other = 3
      description,
      deliveryLocationLatitude,
      deliveryLocationLongitude
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
