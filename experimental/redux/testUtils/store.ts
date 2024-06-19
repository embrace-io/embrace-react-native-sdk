import {
  legacy_createStore as createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Reducer,
} from "redux";

import otelMiddleware from "../otelMiddleware";
import {createInstanceProvider} from "../../testUtils/helpers/provider";

type IncrementAction = {
  type: "COUNTER_INCREASE";
  count: number;
};

type DecrementAction = {
  type: "COUNTER_DECREASE";
  count: number;
};

// Define initial state type and state
type CounterState = {
  count: number;
};

const initialCounterState: CounterState = {
  count: 0,
};

const counterIncrease = (count = 1): IncrementAction => ({
  type: "COUNTER_INCREASE",
  count,
});

const counterDecrease = (count = 1): DecrementAction => ({
  type: "COUNTER_DECREASE",
  count,
});

/**
 * Counter actions (for testing purposes)
 */
type CounterActions = IncrementAction | DecrementAction;
const counterActions = {increase: counterIncrease, decrease: counterDecrease};

/**
 * Counter reducer (for testing purposes)
 */
const counterReducer: Reducer<CounterState, CounterActions> = (
  state = initialCounterState,
  action,
) => {
  switch (action.type) {
    case "COUNTER_INCREASE":
      return {...state, count: state.count + action.count};
    case "COUNTER_DECREASE":
      return {...state, count: state.count - action.count};
    default:
      return state;
  }
};

/**
 * Root reducer (in case of multiple reducers)
 */
const rootReducer = combineReducers({
  counter: counterReducer,
});

type RootState = ReturnType<typeof rootReducer>;

const provider = createInstanceProvider();

const otelLoggerMiddleware = otelMiddleware<RootState>(provider, {
  name: "redux",
  version: "0.1.0",
});

/**
 * Store
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const store = createStore(
  rootReducer,
  compose(applyMiddleware(otelLoggerMiddleware)),
);

type AppDispatch = typeof store.dispatch;

export default store;
export {counterActions};
export type {RootState, AppDispatch};
