import makeWASocket, { useMultiFileAuthState, makeInMemoryStore } from "@adiwajshing/baileys";
import pino from "pino";
import Events from "./Library/Events";
import { release } from "os";
import cfg from "./Config/Config.json";
import Functions from "./Library/Functions";
import { MemoryStore } from "./Library/Types";
import { checkUpdates, getListCommands } from "./Library/Modules";

const store: MemoryStore = makeInMemoryStore({ logger: pino().child({ level: "debug", stream: "store" }) });
store.readFromFile("./Data/MemoryStore.json");

async function start() {
    await checkUpdates();
    const command = await getListCommands();
    const Auth = await useMultiFileAuthState(cfg.SESSION_FOLDER);
    const setsu = makeWASocket({
        auth: Auth.state,
        printQRInTerminal: false,
        browser: ["Setsu-Bot", "safari", release()],
        logger: pino({ level: "silent" }),
        syncFullHistory: true,
        markOnlineOnConnect: true,
        downloadHistory: true,
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid!, key.id!, undefined);
                return msg?.message || undefined;
            }
            // only if store is present
            return {
                conversation: "hello",
            };
        },
    });
    const fn = Functions(setsu);
    Events(fn, Auth, command, store);
}

start();
export { start };
