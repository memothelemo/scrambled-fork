// Preload the entire prerequisites of the game before Flamework starts

import { Modding } from "@flamework/core";
import Log, { Logger, LogLevel } from "@rbxts/log";

Modding.registerDependency<Logger>((ctor) =>
	Log.Configure()
		.SetMinLogLevel(LogLevel.Verbose)
		.WriteTo(
			Log.RobloxOutput({
				Prefix: tostring(ctor),
			}),
		)
		.Create(),
);
