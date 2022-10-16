import Rodux from "@rbxts/rodux";
import { DEFAULT_USER_DATA } from "shared/definitions/user";
import { UserData } from "types/user";
import { ActionSetUserData } from "../actions/userdata";

export type UserDataReducer = UserData;
export type UserDataReducerActions = ActionSetUserData;

const initialState: UserDataReducer = DEFAULT_USER_DATA;

export const userDataReducer = Rodux.createReducer<UserDataReducer, UserDataReducerActions>(initialState, {
	setUserData: (_, action) => action.newData,
});
