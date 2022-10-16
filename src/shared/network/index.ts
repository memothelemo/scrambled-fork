import { Networking } from "@flamework/networking";
import { SerializedResult } from "shared/serde/rust/Result";
import { UserData } from "types/user";
import { ratelimitingMiddleware } from "./middlewares/ratelimiting";

interface ServerEvents {}

interface ClientEvents {
	onUserDataChanged: (newData: UserData) => void;
}

interface ServerFunctions {
	isValidWord: (word: string) => boolean;

	requestUserData: () => SerializedResult<UserData, string>;
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>({
	isValidWord: [
		ratelimitingMiddleware({
			resetIntervalTime: 1,
			allowanceOnReset: 2,
		}),
	],
	requestUserData: [
		ratelimitingMiddleware({
			resetIntervalTime: 1,
			allowanceOnReset: 10,
		}),
	],
});
