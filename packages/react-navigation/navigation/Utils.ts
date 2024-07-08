import {IHistory, INavigationState} from "./interfaces/NavigationInterfaces";

/**
 * This method loops into the Navigation history state and returns the whole history sorted
 * @param navigationState This Object is the current Navigation State
 * @param historyName This array stores the founded active Screens
 * @returns Returns an Array with the whole navigation History
 */
export const findNavigationHistory = (
  navigationState: INavigationState,
  historyName: IHistory[] = [],
) => {
  if (!navigationState) {
    return historyName;
  }
  const {state, name} = navigationState;
  if (name) {
    historyName.push({name});
  }
  if (state) {
    findNavigationHistory(state, historyName);
  } else {
    const {index, routes, type} = navigationState;
    if (routes && routes.length > 0) {
      if (type === "stack") {
        routes.forEach(route => {
          findNavigationHistory(route, historyName);
        });
      } else {
        findNavigationHistory(routes[index], historyName);
      }
    }
  }
  return historyName;
};
