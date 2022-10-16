import Rodux from "@rbxts/rodux";
import { UserData } from "types/user";

export interface ActionSetUserData extends Rodux.Action<"setUserData"> {
	newData: UserData;
}
