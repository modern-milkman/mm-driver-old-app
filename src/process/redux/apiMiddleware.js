import Api from 'Api';
import { Types as TransientTypes } from 'Reducers/transient';

const setLoading = ({ next, options, isLoading }) => {
  if (!options.key) {
    return;
  }
  // the value can be an id, it defaults to true if not specified
  const value = isLoading ? options.value || true : false;
  next({ type: TransientTypes.UPDATE_PROPS, props: { [options.key]: value } });
};

const apiMiddleware = () => next => action => {
  const { type, actions = {}, promise, ...rest } = action;

  if (type !== Api.API_CALL) {
    return next(action);
  }

  const { fail, load = {}, success } = actions;

  setLoading({ next, options: load, isLoading: true });

  return promise
    .then(payload => {
      if (success && success.type) {
        return next({ ...rest, payload: payload?.data, ...success });
      }
    })
    .catch(error => {
      const response = error.response;

      if (fail && fail.type) {
        return next({
          ...rest,
          ...response,
          error,
          ...fail
        });
      }
    })
    .finally(setLoading.bind(null, { next, options: load, isLoading: false }));
};

export default apiMiddleware;
