import { Result } from "@rbxts/rust-classes";

/**
 * Returns a Result object from an associated Promise object.
 */
export async function toResult<T extends defined>(promise: Promise<T>): Promise<Result<T, string>> {
	try {
		const value = (await promise) as T;
		return Result.ok(value);
	} catch (err) {
		return Result.err(tostring(err));
	}
}
