import Rodux from "@rbxts/rodux";
import { UserData } from "types/user";
import { userDataReducer, UserDataReducerActions } from "./reducers/userdata";

export interface StoreState {
	userData: UserData;
}
export type StoreActions = UserDataReducerActions;

const storeReducer = Rodux.combineReducers<StoreState, StoreActions>({
	userData: userDataReducer,
});

/** @client */
export const Store = new Rodux.Store<StoreState, StoreActions, typeof Rodux.loggerMiddleware>(storeReducer, {}, [
	Rodux.loggerMiddleware,
]);
