import { Bin } from "@rbxts/bin";
import { UserDataProfile } from "server/services/user/data";

export class User {
	public constructor(
		public readonly instance: Player,
		private profile: UserDataProfile,
		public readonly bin: Bin = new Bin(),
	) {}
}
