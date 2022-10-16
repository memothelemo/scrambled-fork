import { Modding } from "@flamework/core";

/** @metadata macro */
export function getSetOfListeners<T>(mt?: Modding.Generic<T, "id">): Set<T> {
	const set = new Set<T>();
	Modding.onListenerAdded((obj) => set.add(obj as T), mt!.id);
	Modding.onListenerRemoved((obj) => set.delete(obj as T), mt!.id);
	return set;
}
