import Api from 'Api';

export default function apiMiddleware() {
  return (next) => (action) => {
    const { type, actions = {}, promise, ...rest } = action;

    if (type !== Api.API_CALL) {
      return next(action);
    }

    const { success, fail } = actions;

    return promise
      .then((payload) => {
        if (success && success.type) {
          next({ ...rest, payload: payload.data, type: success.type });
        }
      })
      .catch((error) => {
        const response = error.response || {
          statusText: error.message,
          status: 'TIMEOUT'
        };

        if (fail && fail.type) {
          next({
            ...rest,
            type: fail.type,
            ...response,
            error
          });
        } else {
          next({
            ...rest,
            type:
              response.status === 'TIMEOUT' ? Api.NETWORK_ERROR : Api.API_ERROR,
            ...response,
            error
          });
        }
      });
  };
}
