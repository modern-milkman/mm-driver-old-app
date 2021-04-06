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
          return next({ ...rest, payload: payload?.data, ...success });
        }
      })
      .catch((error) => {
        const response = error.response;

        if (fail && fail.type) {
          return next({
            ...rest,
            ...response,
            error,
            ...fail
          });
        }
      });
  };
}
