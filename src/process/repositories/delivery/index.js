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
  getCustomerClaims({ customerId }) {
    return Api.get(`/Claim/GetDriverClaims/${customerId}`);
  },
  getForDriver() {
    return Api.get('/Delivery/GetForDriver');
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
    reasonId,
    description,
    deliveryLocationLatitude = null,
    deliveryLocationLongitude = null
  ) {
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
