import { Service } from "@flamework/core";
import { Logger } from "@rbxts/log";
import { Functions } from "server/network";
import { DictionaryService } from ".";

@Service({})
export class DictionaryNetworkService {
	constructor(logger: Logger, dictionaryService: DictionaryService) {
		Functions.isValidWord.setCallback((player, word) => {
			logger.Debug("{@Player} requested isValidWord function; word = {Word}", player, word);
			return dictionaryService.isValidWord(word);
		});
	}
}
