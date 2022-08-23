import { AuthenticationState, DisconnectReason } from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";
import * as QR from "qrcode-terminal";
import Logger from "./Logger";
import { rm } from "fs/promises";
import { WAMethods } from "./Functions";
import { Serialize } from "./Serialize";
import { MemoryStore } from "./Types";
import * as config from "../Config/Config.json";
import Setsu from "../Setsu";
import { ListCommands } from "./Modules";
type Auth = {
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
};
const Jid = new Map<string, string | undefined>([["jid", undefined]]);
const Timestamp = new Map<string, number | null>([["timestamp", null]]);
const Events = (setsu: WAMethods, Auth: Auth, command: ListCommands, store: MemoryStore) => {
    store.bind(setsu.ev);
    setsu.ev.on("connection.update", async (update) => {
        const { qr, connection, lastDisconnect } = update;
        if (connection === "connecting") {
            Logger.warn("Connecting...", "#ff6200");
        }
        if (connection === "close") {
            // if (lastDisconnect?.error?.message === DisconnectReason.)
            if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut) {
                Logger.warn("WhatsApp Web has been logged out!, Detaching session.json", "#eb2e21");
                await rm("./Data/Session", { force: true, recursive: true });
                process.exit();
            }
            // console.log(lastDisconnect);
            if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.connectionReplaced) {
                Logger.warn("Connection Replaced!", "#962eff");
            }
            if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired) {
                Logger.warn("Restart Required!!!", "#f1ff2e");
                // spawn("ts-node index.ts", process.argv, { cwd: process.cwd(), detached: true, stdio: "inherit" });
                const { start } = await import("../index");
                start();
            }
            if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.connectionClosed) {
                Logger.warn("Connection Closed", "#1564ed");
                process.exit();
            }
            if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.timedOut) {
                Logger.warn("Request Timed Out!!!", "#ff5b2e");
                process.exit();
            }
            if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.connectionLost) {
                Logger.warn("Connection Lost, Reconnecting!", "#dbe610");
                setTimeout(async () => {
                    const { start } = await import("../index");
                    start();
                }, 2000);
            }
        }
        if (qr) {
            QR.generate(qr, { small: true });
            Logger.warn("Scan bang!", "#2effe0");
        }
        if (connection === "open") {
            Logger.warn("Connected...", "#70ff2e");
        }
    });
    setsu.ev.on("creds.update", Auth.saveCreds);
    setsu.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            store.writeToFile("./Data/MemoryStore.json");
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            if (mek.key && mek.key.remoteJid === "status@broadcast") return;
            if (mek.key.id?.startsWith("BAE5") && mek.key.id.length === 16) return;
            if (Jid.get("jid") === mek.key.remoteJid && parseInt(mek.messageTimestamp?.toString()!) - Timestamp.get("timestamp")! < 4) {
                Logger.warn("Duplicate message detected from " + mek.key.remoteJid, "#869BB9");
                return;
            }
            const m = await Serialize(setsu, mek, store);
            Jid.set("jid", mek.key.remoteJid!);
            Timestamp.set("timestamp", parseInt(mek.messageTimestamp?.toString()!));
            Setsu(setsu, m, command);
        } catch (err) {
            console.log(err);
        }
    });
    setsu.ev.on("blocklist.set", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: blocklist_set", m) : null;
    });
    setsu.ev.on("blocklist.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: blocklist_update", m) : null;
    });
    setsu.ev.on("call", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: call", m) : null;
        setsu.rejectCall(m[0]);
    });
    setsu.ev.on("chats.delete", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: chats.delete", m) : null;
    });
    setsu.ev.on("chats.set", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: chats.set", m) : null;
    });
    setsu.ev.on("chats.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: chats.update", m) : null;
    });
    setsu.ev.on("chats.upsert", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: chats.upsert", m) : null;
    });
    setsu.ev.on("contacts.set", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: contacts.set", m) : null;
    });
    setsu.ev.on("contacts.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: contacts.update", m) : null;
    });
    setsu.ev.on("contacts.upsert", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: contacts.upsert", m) : null;
    });
    setsu.ev.on("group-participants.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: group-participants.update", m) : null;
    });
    setsu.ev.on("groups.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: groups.update", m) : null;
    });
    setsu.ev.on("groups.upsert", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: groups.upsert", m) : null;
    });
    setsu.ev.on("message-receipt.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: message-receipt.update", m) : null;
    });
    setsu.ev.on("messages.delete", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: messages.delete", m) : null;
    });
    setsu.ev.on("messages.media-update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: messages.media-update", m) : null;
    });
    setsu.ev.on("messages.reaction", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: messages.reaction", m) : null;
    });
    setsu.ev.on("messages.set", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: messages.set", m) : null;
    });
    setsu.ev.on("messages.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: messages.update", m) : null;
    });
    setsu.ev.on("presence.update", (m) => {
        store.writeToFile("./Data/MemoryStore.json");
        config.enableLogs ? console.log("Type: presence.update", m) : null;
    });
};
export default Events;
