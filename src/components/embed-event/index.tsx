import type { DecodeResult } from "nostr-tools/lib/nip19";
import { CardProps } from "@chakra-ui/react";

import EmbeddedNote from "./event-types/embedded-note";
import useSingleEvent from "../../hooks/use-single-event";
import { NoteLink } from "../note-link";
import { NostrEvent } from "../../types/nostr-event";
import { Kind, nip19 } from "nostr-tools";
import useReplaceableEvent from "../../hooks/use-replaceable-event";
import RelayCard from "../../views/relays/components/relay-card";
import { STREAM_CHAT_MESSAGE_KIND, STREAM_KIND } from "../../helpers/nostr/stream";
import { GOAL_KIND } from "../../helpers/nostr/goal";
import { safeDecode } from "../../helpers/nip19";
import EmbeddedStream from "./event-types/embedded-stream";
import { EMOJI_PACK_KIND } from "../../helpers/nostr/emoji-packs";
import EmbeddedEmojiPack from "./event-types/embedded-emoji-pack";
import EmbeddedGoal, { EmbeddedGoalOptions } from "./event-types/embedded-goal";
import EmbeddedUnknown from "./event-types/embedded-unknown";
import { NOTE_LIST_KIND, PEOPLE_LIST_KIND } from "../../helpers/nostr/lists";
import EmbeddedList from "./event-types/embedded-list";
import EmbeddedArticle from "./event-types/embedded-article";
import EmbeddedBadge from "./event-types/embedded-badge";
import EmbeddedStreamMessage from "./event-types/embedded-stream-message";
import { COMMUNITY_DEFINITION_KIND } from "../../helpers/nostr/communities";
import EmbeddedCommunity from "./event-types/embedded-community";

export type EmbedProps = {
  goalProps?: EmbeddedGoalOptions;
};

export function EmbedEvent({
  event,
  goalProps,
  ...cardProps
}: Omit<CardProps, "children"> & { event: NostrEvent } & EmbedProps) {
  switch (event.kind) {
    case Kind.Text:
      return <EmbeddedNote event={event} {...cardProps} />;
    case STREAM_KIND:
      return <EmbeddedStream event={event} {...cardProps} />;
    case GOAL_KIND:
      return <EmbeddedGoal goal={event} {...cardProps} {...goalProps} />;
    case EMOJI_PACK_KIND:
      return <EmbeddedEmojiPack pack={event} {...cardProps} />;
    case PEOPLE_LIST_KIND:
    case NOTE_LIST_KIND:
      return <EmbeddedList list={event} {...cardProps} />;
    case Kind.Article:
      return <EmbeddedArticle article={event} {...cardProps} />;
    case Kind.BadgeDefinition:
      return <EmbeddedBadge badge={event} {...cardProps} />;
    case STREAM_CHAT_MESSAGE_KIND:
      return <EmbeddedStreamMessage message={event} {...cardProps} />;
    case COMMUNITY_DEFINITION_KIND:
      return <EmbeddedCommunity community={event} {...cardProps} />;
  }

  return <EmbeddedUnknown event={event} {...cardProps} />;
}

export function EmbedEventPointer({ pointer, ...props }: { pointer: DecodeResult } & EmbedProps) {
  switch (pointer.type) {
    case "note": {
      const event = useSingleEvent(pointer.data);
      if (event === undefined) return <NoteLink noteId={pointer.data} />;
      return <EmbedEvent event={event} {...props} />;
    }
    case "nevent": {
      const event = useSingleEvent(pointer.data.id, pointer.data.relays);
      if (event === undefined) return <NoteLink noteId={pointer.data.id} />;
      return <EmbedEvent event={event} {...props} />;
    }
    case "naddr": {
      const event = useReplaceableEvent(pointer.data);
      if (!event) return <span>{nip19.naddrEncode(pointer.data)}</span>;
      return <EmbedEvent event={event} {...props} />;
    }
    case "nrelay":
      return <RelayCard url={pointer.data} />;
  }
  return null;
}

export function EmbedEventNostrLink({ link, ...props }: { link: string } & EmbedProps) {
  const pointer = safeDecode(link);

  return pointer ? <EmbedEventPointer pointer={pointer} {...props} /> : <>{link}</>;
}
