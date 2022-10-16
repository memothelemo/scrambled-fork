import { Controller } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Option } from "@rbxts/rust-classes";
import { Functions } from "client/network";

@Controller({})
export class DictionaryController {
	private words = new Map<string, boolean>();

	constructor(private readonly logger: Logger) {}

	async isValidWord(word: string): Promise<Option<boolean>> {
		// get from cache itself
		const value = this.words.get(word);
		if (value !== undefined) {
			this.logger.Verbose("Word has been validated before, returned as {Value}; word = {Word}", value, word);
			return Option.some(value);
		}

		// fetch to the server
		this.logger.Debug("Word not validated yet, checking it from the server; word = {Word}", word);
		try {
			const value = await Functions.isValidWord(word);
			return Option.some(value);
		} catch (err) {
			this.logger.Error("Failed to check word for `{Word}`: {Source}", word, err);
			return Option.none();
		}
	}
}
