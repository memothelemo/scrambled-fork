import { Bin } from "@rbxts/bin";
import { UserDataProfile } from "server/services/user/data";
import { UserData } from "types/user";
import { DeepReadonly } from "types/utils";

export class User {
	public data: DeepReadonly<UserData>;

	public constructor(
		public readonly instance: Player,
		private profile: UserDataProfile,
		public readonly bin: Bin = new Bin(),
	) {
		this.data = profile.Data;
	}
}
