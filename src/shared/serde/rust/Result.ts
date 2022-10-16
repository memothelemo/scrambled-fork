import { Result } from "@rbxts/rust-classes";
import { t } from "@rbxts/t";

export type SerializedResult<Ok = defined, Err = defined> = { type: "Ok"; value: Ok } | { type: "Err"; value: Err };

const validateSerialized = t.union(
	t.interface({
		type: t.literal("Ok"),
		value: t.any,
	}),
	t.interface({
		type: t.literal("Err"),
		value: t.any,
	}),
);

export namespace ResultSerde {
	export function deserialize<Ok extends defined, Err extends defined>(
		serialized: unknown,
	): Result<Result<Ok, Err>, string>;
	export function deserialize<Ok extends defined, Err extends defined>(
		serialized: SerializedResult<Ok, Err>,
	): Result<Result<Ok, Err>, string>;
	export function deserialize<Ok extends defined, Err extends defined>(
		serialized: unknown,
	): Result<Result<Ok, Err>, string> {
		if (!validateSerialized(serialized)) {
			return Result.err("Invalid serialized option structure");
		}
		if (serialized.type === "Ok") {
			assert(serialized.value !== undefined);
			return Result.ok(Result.ok(serialized.value as Ok));
		} else {
			return Result.ok(Result.err(serialized.value as Err));
		}
	}

	export function serialize<Ok extends defined, Err extends defined>(
		result: Result<Ok, Err>,
	): SerializedResult<Ok, Err> {
		return result.match<SerializedResult<Ok, Err>>(
			(value) => ({ type: "Ok", value }),
			(value) => ({ type: "Err", value }),
		);
	}
}
