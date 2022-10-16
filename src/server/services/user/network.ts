import { Service } from "@flamework/core";
import { Result } from "@rbxts/rust-classes";
import { User } from "server/entities/user";
import { Functions } from "server/network";
import { ResultSerde } from "shared/serde/rust/Result";
import { UserData } from "types/user";
import { UserService } from ".";

@Service({})
export class UserNetworkService {
	constructor(private readonly userService: UserService) {
		Functions.requestUserData.setCallback((plr) =>
			ResultSerde.serialize<UserData, string>(
				this.userService.getUser(plr).match(
					(v) => Result.ok(v.data),
					() => Result.err("Cannot find user entity"),
				),
			),
		);
	}

	/**
	 * It wraps a callback and replaces the first argument with
	 * player's User entity object
	 */
	withUserEntity<T extends unknown[], R = void>(fn: (user: User, ...args: T) => R) {
		return (player: Player, ...args: T) =>
			this.userService.getUser(player).match(
				(user) => fn(user, ...args),
				() => {},
			);
	}
}
