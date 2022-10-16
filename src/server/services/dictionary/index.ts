import { OnInit, Service } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { t } from "@rbxts/t";

import { $instance } from "rbxts-transformer-fs";

const dictionaryCheck = t.set(t.string);

@Service({})
export class DictionaryService implements OnInit {
	private words!: Set<string>;

	constructor(private logger: Logger) {}

	private loadDictionaryFile(): boolean {
		const now = os.clock();
		let content;
		try {
			content = require($instance<ModuleScript>("build/dictionary/words.lua"));
		} catch (err) {
			this.logger.Warn("Failed to load file: {Source}", err);
			return false;
		}
		const elapsed = os.clock();
		if (dictionaryCheck(content)) {
			this.logger.Info("Successfully loaded file; elapsed = {Elapsed} ms", (elapsed - now) * 1000);
			this.words = content;
			return true;
		} else {
			this.logger.Warn("File validation failed!");
			return false;
		}
	}

	isValidWord(word: string): boolean {
		return this.words.has(word);
	}

	onInit() {
		if (!this.loadDictionaryFile()) {
			this.logger.Warn("Cannot load file, loading an empty dictionary");
			this.words = new Set();
		}
	}
}
