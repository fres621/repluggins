/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { webpack } from "replugged";
import type { Channel, Message } from "discord-types/general";
import type { ChannelStore as _ChannelStore } from "discord-types/stores";
import type { Store } from "replugged/dist/renderer/modules/common/flux";

type MessageStore = Store & { getMessages: (channelId: string) => { toArray: () => Message[] } };
type ChannelStore = Store & _ChannelStore;

interface PendingReply {
  channel: any;
  message: any;
}

const { getChannelId } = webpack.getByStoreName<any>("SelectedChannelStore")!;
const MessageStore = webpack.getByStoreName<MessageStore>("MessageStore")!;
const ChannelStore = webpack.getByStoreName<ChannelStore>("ChannelStore")!;
const { getPendingReply } = webpack.getByProps<{ getPendingReply: (channelId: string) => PendingReply }>("getPendingReply")!;
const { replyToMessage } = webpack.getByProps<{
  replyToMessage: (channel: Channel, message: Message, event: Record<string, never>) => void
}>("replyToMessage")!;
const { createPendingReply, deletePendingReply } = webpack.getByProps<any>("deletePendingReply")!;

function onKeyDown(e: KeyboardEvent) {
  const channelId = getChannelId();
  if (channelId && e.ctrlKey && (e.code == 'ArrowUp' || e.code == 'ArrowDown')) {
    e.stopPropagation();
    const up = e.code == 'ArrowUp';
    const channel = ChannelStore.getChannel(channelId);

    if (!channel) return;

    const messages = MessageStore.getMessages(channelId).toArray();
    const pendingReply = getPendingReply(channelId);
    const replyingId = pendingReply?.message?.id

    if (messages.at(-1)?.id == replyingId && !up) return deletePendingReply(channelId);

    const message = replyingId ?
      messages.find((_, index: number, arr: Message[]) => arr[index + (up ? 1 : -1)]?.id === replyingId) :
      MessageStore.getMessages(channelId).toArray().at(-1);

    if (!message) return;

    // If there's already a pending reply, keep the mention settings, should be the expected (desired) functionality for most people
    if (pendingReply) {
      createPendingReply({ ...pendingReply, message });
    } else {
      replyToMessage(channel, message, {});
    }
  }
}

export function start(): void {
  document.body.addEventListener('keydown', onKeyDown);
}

export function stop(): void {
  document.body.removeEventListener('keydown', onKeyDown);
}
