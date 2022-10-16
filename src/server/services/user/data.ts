import { Service } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { GetProfileStore } from "@rbxts/profileservice";
import { Profile } from "@rbxts/profileservice/globals";
import { Result } from "@rbxts/rust-classes";
import { Players } from "@rbxts/services";
import { DEFAULT_USER_DATA } from "shared/definitions/user";
import { KickCodes } from "types/error";
import { UserData } from "types/user";
import { UserKickService } from "./kick";

export type UserDataProfile = Profile<UserData>;

@Service({})
export class UserDataService {
	private profileStore = GetProfileStore("PlayerData", DEFAULT_USER_DATA);

	constructor(private readonly userKickService: UserKickService, private readonly logger: Logger) {}

	// Inner wrapper for this.profileStore.LoadProfileAsync which it returns
	// as Result because this method may throw an error.
	private loadProfileAsync(profileKey: string): Result<UserDataProfile, string> {
		try {
			this.logger.Debug("Loading profile; profileKey = {ProfileKey}", profileKey);
			const profile = this.profileStore.LoadProfileAsync(profileKey, "ForceLoad");
			if (profile) {
				return Result.ok(profile);
			} else {
				return Result.err("Failed to load profile");
			}
		} catch (err) {
			return Result.err(tostring(err));
		}
	}

	/**
	 * Gets the assigned profile key for loading player's profile
	 */
	getProfileKey(player: Player): string {
		return `player_${player.UserId}`;
	}

	async loadAsync(player: Player): Promise<Result<UserDataProfile, string>> {
		const profileKey = this.getProfileKey(player);
		const result = this.loadProfileAsync(profileKey);
		if (result.isErr()) {
			return result;
		}
		const profile = result.unwrap();

		// The player left upon loading its profile
		if (!player.IsDescendantOf(Players)) {
			profile.Release();
			return Result.err("Player already left the game");
		}

		// TODO: Implement data migration module
		profile.Reconcile();
		profile.ListenToRelease(() => {
			if (!player.IsDescendantOf(game)) return;
			this.logger.Verbose("Profile released for {ProfileKey}", profileKey);
			this.userKickService.kickForBug(player, KickCodes.UserProfileReleased);
		});

		return Result.ok(profile);
	}
}
