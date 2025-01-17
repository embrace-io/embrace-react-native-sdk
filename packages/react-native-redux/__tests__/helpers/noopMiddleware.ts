import {Middleware} from "@reduxjs/toolkit";

const middleware = <
  RootState,
>(): // disabling rule following recommendation on: https://redux.js.org/usage/usage-with-typescript#type-checking-middleware
// eslint-disable-next-line @typescript-eslint/ban-types
Middleware<{}, RootState> => {
  return () => {
    return next => {
      return action => {
        return next(action);
      };
    };
  };
};

export default middleware;
