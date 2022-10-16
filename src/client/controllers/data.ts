import { Controller, OnInit } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Result } from "@rbxts/rust-classes";
import { Events, Functions } from "client/network";
import { Store } from "client/store";
import { ResultSerde } from "shared/serde/rust/Result";
import { UserData } from "types/user";

@Controller({})
export class DataController implements OnInit {
	constructor(private readonly logger: Logger) {}

	private onDataChanged(newData: UserData) {
		Store.dispatch({ type: "setUserData", newData });
	}

	private async requestUserData(): Promise<Result<UserData, string>> {
		const result = await Result.fromPromise(Functions.requestUserData());
		return result.match(
			(v) => ResultSerde.deserialize(v),
			(v) => {
				const err = v.map((v) => tostring(v)).unwrapOr("<unknown error>");
				return Result.err<UserData, string>(err);
			},
		);
	}

	/** @hidden */
	onInit() {
		// this method is infallible (hopefully) so no need to catch any errors
		// it returns a Result however so we need to handle errors on our own.
		this.logger.Info("Getting player's initial data from the server");
		this.requestUserData().andThen((v) =>
			v.match(
				(data) => this.onDataChanged(data),
				(err) => this.logger.Warn("Failed to request initial user data: {Source}", err),
			),
		);
		Events.onUserDataChanged.connect((newData) => this.onDataChanged(newData));
	}
}
