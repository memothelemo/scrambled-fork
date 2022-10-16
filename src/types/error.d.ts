export const enum KickCodes {
	/**
	 * Caused by UserService attempts to bind the player
	 * with User component but it's already binded.
	 */
	PlayerAlreadyBinded = "PLAYER_ALREADY_BINDED",

	/**
	 * Caused by player's profile is already released
	 * from ProfileService and then player is there
	 * in the same server.
	 */
	UserProfileReleased = "PROFILE_RELEASED",

	/**
	 * Caused by a data loading error from UserService
	 * when the player joins the game.
	 */
	LoadProfileFailed = "LOAD_PROFILE_FAILED",
}
