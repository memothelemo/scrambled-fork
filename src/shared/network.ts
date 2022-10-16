import { Networking } from "@flamework/networking";
import { ResultSer } from "@memolemo-studios/result-option-ser";
import { UserData } from "types/user";

type Result<T extends defined, E> = ResultSer.Serialized<T, E>;

interface ServerEvents {}

interface ClientEvents {
	onUserDataChanged: (newData: UserData) => void;
}

interface ServerFunctions {
	isValidWord: (word: string) => boolean;

	requestUserData: () => Result<UserData, string>;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
