import { Service } from "@flamework/core";
import { Logger } from "@rbxts/log";

@Service({})
export class UserKickService {
	constructor(private readonly logger: Logger) {}

	/**
	 * Kicks the player because of a bug happened on the game.
	 * @param player Player to kick from the server
	 * @param code The reason why the player kicked from the server in the first place.
	 */
	kickForBug(player: Player, code: string) {
		// memothelemo:
		// It's better to use code strings imo like BSODs on Windows (ex. IRQ_LESS_OR_EQUAL)
		// because it allows for me and our staff members to easily identify
		// the bug or error rather than in numbers from Brooke (grilme99)'s game
		// or something similar to hers.
		//
		// Shamelessly copied the message from:
		// https://github.com/grilme99/tabletop-island/blob/main/src/server/services/player/player-removal-service.ts
		this.logger.Info("{@Player} kicked from the game; code = {Code}", player, code);
		player.Kick(
			"\n\nYou were kicked from the game because of a bug. This incident is logged internally into our system " +
				"but you should also report it to our staff members in our communication server.\n\n" +
				`Error Code: ${code}`,
		);
	}
}
