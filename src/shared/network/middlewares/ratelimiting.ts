import { Flamework, Modding, Reflect } from "@flamework/core";
import { Networking } from "@flamework/networking";
import { Logger } from "@rbxts/log";
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

		// reset
		if (elapsed >= this.resetInterval) {
			this.reset();
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

class Ratelimiter {}

Reflect.defineMetadata(Ratelimiter, "identifier", Flamework.id<Ratelimiter>());
Reflect.defineMetadata(Ratelimiter, "flamework:isArtificial", true);

type FakeModding = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resolveDependency: <T>(ctor: any, id: any, index: any, options: any) => T;
};

let logger: Logger = undefined as unknown as Logger;

export function ratelimitingMiddleware<I extends unknown[], O>(
	options: RatelimitingOptions,
): Networking.FunctionMiddleware<I, O> {
	const bucketsPerPlayer = new Map<number, RatelimitBucket>();

	// cleanup to prevent memory leaks
	Players.PlayerRemoving.Connect((player) => bucketsPerPlayer.delete(player.UserId));

	return (processNext, event) => {
		// that's so unsafe right?
		logger = (Modding as unknown as FakeModding).resolveDependency(
			Ratelimiter,
			Flamework.id<Logger>(),
			0,
			{},
		) as Logger;
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
					logger.Warn("[{Event}] {@Player} is being ratelimited!", event.name, player);
					return Networking.Skip;
				}
			} else {
				logger.Warn("[{Event}] Event requested with no player", event.name);
			}
			return processNext(player, ...args);
		};
	};
}
