type IncrementAction = {
  type: "COUNTER_INCREASE:slow";
  count: number;
};

type DecrementAction = {
  type: "COUNTER_DECREASE:normal";
  count: number;
};

type CounterState = {
  count: number;
};

const initialCounterState: CounterState = {
  count: 0,
};

const counterIncrease = (count = 1): IncrementAction => ({
  type: "COUNTER_INCREASE:slow",
  count,
});

const counterDecrease = (count = 1): DecrementAction => ({
  type: "COUNTER_DECREASE:normal",
  count,
});

type CounterActions = IncrementAction | DecrementAction;

export {counterIncrease, counterDecrease, initialCounterState};
export type {CounterState, CounterActions};
