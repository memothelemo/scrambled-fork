import { Flamework } from "@flamework/core";

Flamework.addPaths("src/server/components", "src/server/services");
Flamework.addPaths("src/shared/components", "src/shared/flamework");

Flamework.ignite();
