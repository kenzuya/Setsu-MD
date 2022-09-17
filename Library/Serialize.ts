import { proto, getContentType, jidNormalizedUser, downloadMediaMessage, isJidGroup } from "@adiwajshing/baileys";
import moment from "moment-timezone";
import * as global from "../Config/Config.json";
import { WAMethods } from "./Functions";
import { getGroupAdmins } from "./Modules";
import { MemoryStore } from "./Types";
import { MimeType } from "file-type";
type Serializer = ReturnType<typeof Serialize>;
export type MessageSerializer = Awaited<Serializer>;
export const Serialize = async (conn: WAMethods, m: proto.IWebMessageInfo, store: MemoryStore) => {
    if (!m) return m;
    const M = proto.WebMessageInfo;
    const ContentType = getContentType(m.message!);
    const MessageText =
        ContentType === "conversation"
            ? m.message?.conversation
            : ContentType === "imageMessage"
            ? m.message?.imageMessage?.caption
            : ContentType === "videoMessage"
            ? m.message?.videoMessage?.caption
            : ContentType === "extendedTextMessage"
            ? m.message?.extendedTextMessage?.text
            : ContentType === "buttonsResponseMessage"
            ? m.message?.buttonsResponseMessage?.selectedButtonId
            : ContentType === "listResponseMessage"
            ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId
            : ContentType === "templateButtonReplyMessage"
            ? m.message?.templateButtonReplyMessage?.selectedId
            : ContentType === "messageContextInfo"
            ? m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.listResponseMessage?.singleSelectReply?.selectedRowId
            : ContentType === "viewOnceMessage"
            ? m.message?.viewOnceMessage?.message?.imageMessage
                ? m.message?.viewOnceMessage?.message?.imageMessage.caption
                : m.message?.viewOnceMessage?.message?.videoMessage
                ? m.message?.viewOnceMessage?.message?.videoMessage?.caption
                : undefined
            : undefined;
    const DisplayText =
        ContentType === "conversation"
            ? m.message?.conversation
            : ContentType === "buttonsResponseMessage"
            ? m.message?.buttonsResponseMessage?.selectedDisplayText
            : ContentType === "listResponseMessage"
            ? m.message?.listResponseMessage?.title
            : ContentType === "templateButtonReplyMessage"
            ? m.message?.templateButtonReplyMessage?.selectedDisplayText
            : ContentType === "buttonsMessage"
            ? m.message?.buttonsMessage?.contentText
            : ContentType === "extendedTextMessage"
            ? m.message?.extendedTextMessage?.text
            : undefined;
    const MentionedJid =
        ContentType === "audioMessage"
            ? m.message?.audioMessage?.contextInfo?.mentionedJid
            : ContentType === "extendedTextMessage"
            ? m.message?.extendedTextMessage?.contextInfo?.mentionedJid
            : ContentType === "documentMessage"
            ? m.message?.documentMessage?.contextInfo?.mentionedJid
            : ContentType === "imageMessage"
            ? m.message?.imageMessage?.contextInfo?.mentionedJid
            : ContentType === "videoMessage"
            ? m.message?.videoMessage?.contextInfo?.mentionedJid
            : ContentType === "stickerMessage"
            ? m.message?.stickerMessage?.contextInfo?.mentionedJid
            : ContentType === "templateButtonReplyMessage"
            ? m.message?.templateButtonReplyMessage?.contextInfo?.mentionedJid
            : ContentType === "buttonsResponseMessage"
            ? m.message?.buttonsResponseMessage?.contextInfo?.mentionedJid
            : ContentType === "locationMessage"
            ? m.message?.locationMessage?.contextInfo?.mentionedJid
            : ContentType === "liveLocationMessage"
            ? m.message?.liveLocationMessage?.contextInfo?.mentionedJid
            : [];
    const Mimetype = getContentMimetype(m.message!);
    const MessageQuoted =
        ContentType === "audioMessage"
            ? m.message?.audioMessage?.contextInfo?.quotedMessage
            : ContentType === "extendedTextMessage"
            ? m.message?.extendedTextMessage?.contextInfo?.quotedMessage
            : ContentType === "documentMessage"
            ? m.message?.documentMessage?.contextInfo?.quotedMessage
            : ContentType === "imageMessage"
            ? m.message?.imageMessage?.contextInfo?.quotedMessage
            : ContentType === "videoMessage"
            ? m.message?.videoMessage?.contextInfo?.quotedMessage
            : ContentType === "stickerMessage"
            ? m.message?.stickerMessage?.contextInfo?.quotedMessage
            : ContentType === "templateButtonReplyMessage"
            ? m.message?.templateButtonReplyMessage?.contextInfo?.quotedMessage
            : ContentType === "buttonsResponseMessage"
            ? m.message?.buttonsResponseMessage?.contextInfo?.quotedMessage
            : ContentType === "locationMessage"
            ? m.message?.locationMessage?.contextInfo?.quotedMessage
            : ContentType === "liveLocationMessage"
            ? m.message?.liveLocationMessage?.contextInfo?.quotedMessage
            : undefined;
    const MessageQuotedType = MessageQuoted ? getContentType(MessageQuoted) : null;
    const prefixer = global.prefa ? (/^[°•π÷×¶∆£¢€¥®™+✓_/=|~!?@#$%^&.©^]/gi.test(MessageText!) ? MessageText!.match(/^[°•π÷×¶∆£¢€¥®™+✓/_=|~!?@#$%^&.©^]/gi)![0] : "") : global.prefa ?? "";
    const Arguments = MessageText?.trim().split(/ +/).slice(1);
    const Message = ContentType == "viewOnceMessage" ? m.message![ContentType]?.message![getContentType(m.message![ContentType]?.message!)!] : m.message![ContentType!];
    const isCommand = global.prefa.includes(MessageText ? MessageText.charAt(0) : "") ? true : false;
    const UserJid = jidNormalizedUser(m.key.remoteJid!);
    const UserGroupJid = conn.decodeJid((m.key.fromMe && conn.user?.id) || m.participant || m.key.participant || UserJid || "");
    const isGroup = isJidGroup(m.key.remoteJid!);
    const GroupMetadata = isGroup ? await conn.groupMetadata(UserJid) : undefined;
    const GroupParticipant = isGroup ? GroupMetadata?.participants.map((value) => jidNormalizedUser(value.id)) : [];
    const ListGroupAdmins = getGroupAdmins(GroupMetadata!);
    const MessageInfo = {
        footer: `© it's me Setsu || ${moment().locale("id").format("DD MMMM YYYY")}`,
        monospace: "```",
        bold: "*",
        italic: "_",
        id: m.key.id,
        isBaileys: m.key.id!.startsWith("BAE5") && m.key.id!.length === 16,
        chat: UserJid,
        fromMe: m.key.fromMe!,
        isGroup,
        sender: UserGroupJid,
        participant: conn.decodeJid(m.key.participant!) || undefined,
        mtype: ContentType,
        message: Message,
        body: MessageText,
        text: DisplayText,
        isCmd: isCommand,
        command: isCommand ? MessageText?.replace(prefixer, "").trim().split(/ +/).shift()?.toLowerCase() : undefined,
        args: Arguments,
        pushname: m.pushName || "No Name",
        isCreator: [conn?.user?.id, ...global.owner].map((v) => v?.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(UserGroupJid),
        prefix: isCommand ? (global.prefa.includes(MessageText ? MessageText.charAt(0) : "") ? MessageText?.charAt(0) : undefined) : undefined,
        itsMe: UserGroupJid == conn?.user?.id ? true : false,
        mimetype: Mimetype,
        isMedia: /image|video|sticker|audio/.test(Mimetype ? Mimetype : ""),
        query: Arguments?.join(" "),
        mentionedJid: MentionedJid!,
        quoted: MessageQuoted
            ? {
                  message: MessageQuoted,
                  mimetype: getContentMimetype(MessageQuoted),
                  delete: () => conn.sendMessage(UserJid, { delete: M.fromObject(MessageQuoted).key }),
                  mtype: MessageQuotedType,
                  download: async () => await downloadMediaMessage(M.fromObject(MessageQuoted!), "buffer", {}),
                  id: getStanzaID(MessageQuoted),
              }
            : undefined,
        group: isGroup
            ? {
                  name: GroupMetadata?.subject!,
                  sender: UserGroupJid,
                  participant: GroupParticipant!,
                  admin: ListGroupAdmins,
                  isAdmins: ListGroupAdmins.includes(UserGroupJid),
                  isBotAdmins: ListGroupAdmins.includes(jidNormalizedUser(conn.user?.id!)),
                  description: GroupMetadata?.desc?.toString(),
                  restrict: GroupMetadata?.restrict!,
                  announce: GroupMetadata?.announce!,
                  creation: GroupMetadata?.creation!,
                  ephemeralDuration: GroupMetadata?.ephemeralDuration,
              }
            : undefined,
        reply: (text: string) => conn.sendMessage(UserJid, { text }, { quoted: m }),
    };
    // console.log(GroupMetadata);

    return MessageInfo;
};
// export type MessagesInfo = ReturnType<typeof MessageInfo>;
export function getContentMimetype(Message: proto.IMessage): MimeType | undefined {
    const mtype = getContentType(Message);
    if (mtype === "audioMessage") return Message.audioMessage?.mimetype as MimeType;
    else if (mtype === "imageMessage") return Message.imageMessage?.mimetype as MimeType;
    else if (mtype === "videoMessage") return Message.videoMessage?.mimetype as MimeType;
    else if (mtype === "stickerMessage") return Message.stickerMessage?.mimetype as MimeType;
    else if (mtype === "documentMessage") return Message.documentMessage?.mimetype as MimeType;
    else if (mtype === "viewOnceMessage") {
        const viewOnceType = getContentType(Message.viewOnceMessage?.message as proto.IMessage);
        if (viewOnceType === "imageMessage") return Message.viewOnceMessage?.message?.imageMessage?.mimetype as MimeType;
        else if (viewOnceType === "videoMessage") return Message.viewOnceMessage?.message?.videoMessage?.mimetype as MimeType;
    } else return undefined;
}

export function getMessageText(message: proto.IMessage) {
    const ContentType = getContentType(message);
    const MessageText =
        ContentType === "conversation"
            ? message?.conversation
            : ContentType === "imageMessage"
            ? message?.imageMessage?.caption
            : ContentType === "videoMessage"
            ? message?.videoMessage?.caption
            : ContentType === "extendedTextMessage"
            ? message?.extendedTextMessage?.text
            : ContentType === "buttonsResponseMessage"
            ? message?.buttonsResponseMessage?.selectedButtonId
            : ContentType === "listResponseMessage"
            ? message?.listResponseMessage?.singleSelectReply?.selectedRowId
            : ContentType === "templateButtonReplyMessage"
            ? message?.templateButtonReplyMessage?.selectedId
            : ContentType === "messageContextInfo"
            ? message?.buttonsResponseMessage?.selectedButtonId || message?.listResponseMessage?.singleSelectReply?.selectedRowId
            : ContentType === "viewOnceMessage"
            ? message?.viewOnceMessage?.message?.imageMessage
                ? message?.viewOnceMessage?.message?.imageMessage.caption
                : message?.viewOnceMessage?.message?.videoMessage
                ? message?.viewOnceMessage?.message?.videoMessage?.caption
                : undefined
            : undefined;
    return MessageText;
}

export function getStanzaID(message: proto.IMessage) {
    const ContentType = getContentType(message);
    let ViewOnceContentType;
    if (ContentType === "viewOnceMessage") ViewOnceContentType = getContentType(message.viewOnceMessage?.message!);
    const StanzaID =
        ContentType === "audioMessage"
            ? message.audioMessage?.contextInfo?.stanzaId
            : ContentType === "buttonsMessage"
            ? message.buttonsMessage?.contextInfo?.stanzaId
            : ContentType === "buttonsResponseMessage"
            ? message.buttonsResponseMessage?.contextInfo?.stanzaId
            : ContentType === "cancelPaymentRequestMessage"
            ? message.cancelPaymentRequestMessage?.key?.id
            : ContentType === "chat"
            ? message.chat?.id
            : ContentType === "contactMessage"
            ? message.contactMessage?.contextInfo?.stanzaId
            : ContentType === "contactsArrayMessage"
            ? message.contactsArrayMessage?.contextInfo?.stanzaId
            : ContentType === "declinePaymentRequestMessage"
            ? message.declinePaymentRequestMessage?.key?.id
            : ContentType === "documentMessage"
            ? message.documentMessage?.contextInfo?.stanzaId
            : ContentType === "extendedTextMessage"
            ? message.extendedTextMessage?.contextInfo?.stanzaId
            : ContentType === "groupInviteMessage"
            ? message.groupInviteMessage?.contextInfo?.stanzaId
            : ContentType === "imageMessage"
            ? message.imageMessage?.contextInfo?.stanzaId
            : ContentType === "interactiveMessage"
            ? message.interactiveMessage?.contextInfo?.stanzaId
            : ContentType === "interactiveResponseMessage"
            ? message.interactiveResponseMessage?.contextInfo?.stanzaId
            : ContentType === "keepInChatMessage"
            ? message.keepInChatMessage?.key?.id
            : ContentType === "listMessage"
            ? message.listMessage?.contextInfo?.stanzaId
            : ContentType === "listResponseMessage"
            ? message.listResponseMessage?.contextInfo?.stanzaId
            : ContentType === "liveLocationMessage"
            ? message.liveLocationMessage?.contextInfo?.stanzaId
            : ContentType === "locationMessage"
            ? message.locationMessage?.contextInfo?.stanzaId
            : ContentType === "orderMessage"
            ? message.orderMessage?.contextInfo?.stanzaId
            : ContentType === "pollCreationMessage"
            ? message.pollCreationMessage?.contextInfo?.stanzaId
            : ContentType === "pollUpdateMessage"
            ? message.pollUpdateMessage?.pollCreationMessageKey?.id
            : ContentType === "productMessage"
            ? message.productMessage?.contextInfo?.stanzaId
            : ContentType === "protocolMessage"
            ? message.protocolMessage?.key?.id
            : ContentType === "reactionMessage"
            ? message.reactionMessage?.key?.id
            : ContentType === "stickerMessage"
            ? message.stickerMessage?.contextInfo?.stanzaId
            : ContentType === "templateButtonReplyMessage"
            ? message.templateButtonReplyMessage?.contextInfo?.stanzaId
            : ContentType === "templateMessage"
            ? message.templateMessage?.contextInfo?.stanzaId
            : ContentType === "videoMessage"
            ? message.videoMessage?.contextInfo?.stanzaId
            : ContentType === "viewOnceMessage"
            ? ViewOnceContentType === "imageMessage"
                ? message.viewOnceMessage?.message?.imageMessage?.contextInfo?.stanzaId
                : ViewOnceContentType === "videoMessage"
                ? message.viewOnceMessage?.message?.videoMessage?.contextInfo?.stanzaId
                : undefined
            : undefined;

    return StanzaID;
}
