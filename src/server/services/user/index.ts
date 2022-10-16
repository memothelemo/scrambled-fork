import { OnInit, OnStart, Service } from "@flamework/core";
import { ResultSer } from "@memolemo-studios/result-option-ser";
import { Bin } from "@rbxts/bin";
import { Logger } from "@rbxts/log";
import { Option, Result } from "@rbxts/rust-classes";
import { Players } from "@rbxts/services";
import { User } from "server/entities/user";
import { Functions } from "server/network";
import { getSetOfListeners } from "shared/flamework/macros";
import { KickCodes as KickCodes } from "types/error";
import { UserData } from "types/user";
import { UserDataService } from "./data";
import { UserKickService } from "./kick";

export interface OnUserJoin {
	onUserJoin(user: User): void;
}

@Service({})
export class UserService implements OnInit, OnStart {
	private joinListeners = new Set<OnUserJoin>();

	/**
	 * This to avoid race conditions when a player joins
	 * the game and then UserService::onStart is called as well
	 * as the Players.PlayerAdded event.
	 *
	 * I don't want to reference a Player because memory
	 * leaks will probably occur right here.
	 */
	private activeUsers = new Set<number>();
	private userEntities = new Map<number, User>();

	public constructor(
		private readonly logger: Logger,
		private readonly userKickService: UserKickService,
		private readonly userDataService: UserDataService,
	) {}

	private async onPlayerAdded(player: Player) {
		const userId = player.UserId;
		if (this.activeUsers.has(userId)) return;
		this.activeUsers.add(userId);
		this.logger.Verbose("{@Player} joined the game; initializing as user...", player);

		// Load player's data in the other hand
		const result = (await Result.fromPromise(this.userDataService.loadAsync(player))).match(
			(v) => v,
			(v) => Result.err(v.map((v) => tostring(v)).unwrapOr("<unknown error>")),
		);
		if (result.isErr()) {
			this.logger.Warn("Failed to load player's profile: {Source}", result.unwrapErr());
			this.userKickService.kickForBug(player, KickCodes.LoadProfileFailed);
			return;
		}
		this.logger.Info("Successfully loaded profile for {@Player}", player);

		// Create user entity
		const profile = result.unwrap();
		const bin = new Bin();
		const user = new User(player, profile, bin);
		this.userEntities.set(player.UserId, user);

		bin.add(() => {
			this.logger.Info("{@Player} left the game; releasing profile...", player);
			this.activeUsers.delete(player.UserId);
			this.userEntities.delete(player.UserId);

			profile.Release();
			this.logger.Verbose("Done releasing profile for {@Player}", player);
		});

		// Call all connected lifecycle events
		this.logger.Info("{@Player} logged in successfully!", player);
		for (const listener of this.joinListeners) {
			task.spawn((v) => listener.onUserJoin(v), user);
		}
	}

	private onPlayerRemoving(player: Player) {
		this.getUser(player).match(
			(user) => user.bin.destroy(),
			() => {},
		);
	}
	/**
	 * Gets the User component for the player.
	 */
	getUser(player: Player): Option<User> {
		return Option.wrap(this.userEntities.get(player.UserId));
	}

	/**
	 * It wraps a callback and replaces the first argument with
	 * player's User entity object
	 */
	withUserEntity<T extends unknown[], R = void>(fn: (user: User, ...args: T) => R) {
		return (player: Player, ...args: T) =>
			this.getUser(player).match(
				(user) => fn(user, ...args),
				() => {},
			);
	}

	/** @hidden */
	onInit() {
		this.joinListeners = getSetOfListeners<OnUserJoin>();

		Functions.requestUserData.setCallback((plr) =>
			ResultSer.serialize<UserData, string>(
				this.getUser(plr).match(
					(v) => Result.ok(v.data),
					() => Result.err("Cannot find user entity"),
				),
			),
		);

		Players.PlayerAdded.Connect((plr) => this.onPlayerAdded(plr));
		Players.PlayerRemoving.Connect((plr) => this.onPlayerRemoving(plr));
	}

	/** @hidden */
	onStart() {
		for (const player of Players.GetPlayers()) {
			task.spawn((v) => this.onPlayerAdded(v), player);
		}
	}
}
