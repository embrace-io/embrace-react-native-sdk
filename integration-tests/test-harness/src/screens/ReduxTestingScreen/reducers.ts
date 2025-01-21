import {combineReducers, Reducer} from "@reduxjs/toolkit";
import {initialCounterState, CounterState, CounterActions} from "./actions";

/**
 * Counter reducer (for testing purposes)
 */
const counterReducer: Reducer<CounterState, CounterActions> = (
  state = initialCounterState,
  action,
) => {
  switch (action.type) {
    case "COUNTER_INCREASE:slow": {
      // NOTE: adding slowness to the action for testing purposes
      const test = new Array(1000000);
      test.forEach((_, index) => (test[index] = true));
      return {...state, count: state.count + action.count};
    }
    case "COUNTER_DECREASE:normal": {
      return {...state, count: state.count - action.count};
    }
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  counter: counterReducer,
});

type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
export type {RootState};
