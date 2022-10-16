import { Option, Result } from "@rbxts/rust-classes";
import { t } from "@rbxts/t";

export type SerializedOption<T = defined> = { type: "Some"; value: T } | { type: "None" };

const validateSerialized = t.union(
	t.interface({
		type: t.literal("Some"),
		value: t.any,
	}),
	t.interface({
		type: t.literal("None"),
	}),
);

export namespace OptionSerde {
	export function deserialize<T extends defined>(serialized: unknown): Result<Option<T>, string>;
	export function deserialize<T extends defined>(serialized: SerializedOption<T>): Result<Option<T>, string>;
	export function deserialize<T extends defined>(serialized: unknown): Result<Option<T>, string> {
		if (!validateSerialized(serialized)) {
			return Result.err("Invalid serialized option structure");
		}
		if (serialized.type === "Some") {
			assert(serialized.value !== undefined);
			return Result.ok(Option.some(serialized.value as T));
		} else {
			return Result.ok(Option.none());
		}
	}

	export function serialize<T extends defined>(option: Option<T>): SerializedOption<T> {
		return option.match<SerializedOption<T>>(
			(value) => ({ type: "Some", value }),
			() => ({ type: "None" }),
		);
	}
}
