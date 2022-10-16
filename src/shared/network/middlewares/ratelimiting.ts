import { Networking } from "@flamework/networking";
import Log from "@rbxts/log";
import { Players } from "@rbxts/services";

class RatelimitBucket {
	lastResetTime: number;
	resetInterval: number;
	allowanceOnReset: number;
	budget: number;

	constructor({ resetIntervalTime, allowanceOnReset }: RatelimitingOptions) {
		this.lastResetTime = os.clock();
		this.resetInterval = resetIntervalTime;
		this.allowanceOnReset = allowanceOnReset;
		this.budget = allowanceOnReset;
	}

	reset() {
		this.lastResetTime = os.clock();
		this.budget = this.allowanceOnReset;
	}

	perform(): boolean {
		const now = os.clock();
		const elapsed = now - this.lastResetTime;

		// reset and then return true
		if (elapsed >= this.resetInterval) {
			this.reset();
			return true;
		}

		if (this.budget === 0) return false;
		this.budget -= 1;
		return true;
	}
}

interface RatelimitingOptions {
	/**
	 * Amount of time to reset the budget per
	 * player in seconds
	 */
	resetIntervalTime: number;

	/**
	 * Amount of initial budget when reset interval is
	 * reached or the player first send an event.
	 */
	allowanceOnReset: number;
}

export function ratelimitingMiddleware<I extends unknown[], O>(
	options: RatelimitingOptions,
): Networking.FunctionMiddleware<I, O> {
	const bucketsPerPlayer = new Map<number, RatelimitBucket>();

	// cleanup to prevent memory leaks
	Players.PlayerRemoving.Connect((player) => bucketsPerPlayer.delete(player.UserId));

	return (processNext, event) => {
		return async (player, ...args) => {
			if (player) {
				const playerUserId = player.UserId;
				let bucket = bucketsPerPlayer.get(playerUserId);
				if (bucket === undefined) {
					bucket = new RatelimitBucket(options);
					bucketsPerPlayer.set(playerUserId, bucket);
				}
				const ratelimited = !bucket.perform();
				if (ratelimited) {
					Log.Warn("[{Event}] {@Player} is being ratelimited!", event.name, player);
					return Networking.Skip;
				}
			} else {
				Log.Warn("[{Event}] Event requested with no player added", event.name);
			}
			return processNext(player, ...args);
		};
	};
}
