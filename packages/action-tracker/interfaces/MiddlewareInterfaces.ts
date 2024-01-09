interface IAction<T = any> {
  type: T;
}

/**
 * This interface defines the action instance structure
 */
export interface IAnyAction extends IAction {
  [extraProps: string]: any;
}
/**
 * This interface defines the dispatch instance structure
 */
export type IDispatch<A extends IAction = IAnyAction> = <T extends A>(
  action: T
) => T;

/**
 * This interface defines the Middleware instance structure
 */
export interface IMiddleware<D extends IDispatch = IDispatch, S = any> {
  dispatch: D;
  getState(): S;
}
