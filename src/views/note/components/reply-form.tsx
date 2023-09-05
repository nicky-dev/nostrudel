import { useMemo } from "react";
import { Box, Button, ButtonGroup, Flex, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Kind } from "nostr-tools";
import dayjs from "dayjs";

import { NostrEvent } from "../../../types/nostr-event";
import { UserAvatarStack } from "../../../components/compact-user-stack";
import { ThreadItem, getThreadMembers } from "../../../helpers/thread";
import { NoteContents } from "../../../components/note/note-contents";
import {
  addReplyTags,
  createEmojiTags,
  ensureNotifyPubkeys,
  finalizeNote,
  getContentMentions,
} from "../../../helpers/nostr/post";
import { useCurrentAccount } from "../../../hooks/use-current-account";
import { useSigningContext } from "../../../providers/signing-provider";
import { useWriteRelayUrls } from "../../../hooks/use-client-relays";
import NostrPublishAction from "../../../classes/nostr-publish-action";
import { unique } from "../../../helpers/array";
import MagicTextArea from "../../../components/magic-textarea";
import { useContextEmojis } from "../../../providers/emoji-provider";
import UserDirectoryProvider from "../../../providers/user-directory-provider";

export type ReplyFormProps = {
  item: ThreadItem;
  onCancel: () => void;
  onSubmitted?: (event: NostrEvent) => void;
};

export default function ReplyForm({ item, onCancel, onSubmitted }: ReplyFormProps) {
  const toast = useToast();
  const account = useCurrentAccount();
  const emojis = useContextEmojis();
  const { requestSignature } = useSigningContext();
  const writeRelays = useWriteRelayUrls();

  const threadMembers = useMemo(() => getThreadMembers(item, account?.pubkey), [item, account?.pubkey]);
  const { setValue, getValues, watch, handleSubmit } = useForm({
    defaultValues: {
      content: "",
    },
  });
  const contentMentions = getContentMentions(getValues().content);
  const notifyPubkeys = unique([...threadMembers, ...contentMentions]);

  watch("content");

  const draft = useMemo(() => {
    let updated = finalizeNote({ kind: Kind.Text, content: getValues().content, created_at: dayjs().unix(), tags: [] });
    updated = createEmojiTags(updated, emojis);
    updated = addReplyTags(updated, item.event);
    updated = ensureNotifyPubkeys(updated, notifyPubkeys);
    return updated;
  }, [getValues().content, emojis]);

  const submit = handleSubmit(async (values) => {
    try {
      const signed = await requestSignature(draft);
      const pub = new NostrPublishAction("Reply", writeRelays, signed);

      if (onSubmitted) onSubmitted(signed);
    } catch (e) {
      if (e instanceof Error) toast({ description: e.message, status: "error" });
    }
  });

  return (
    <UserDirectoryProvider getDirectory={() => threadMembers}>
      <form onSubmit={submit}>
        <MagicTextArea
          placeholder="Reply"
          autoFocus
          mb="2"
          rows={5}
          isRequired
          value={getValues().content}
          onChange={(e) => setValue("content", e.target.value)}
        />
        {getValues().content.length > 0 && (
          <Box p="2" borderWidth={1} borderRadius="md" mb="2">
            <NoteContents event={draft} />
          </Box>
        )}
        <Flex gap="2" alignItems="center">
          <ButtonGroup size="sm">
            <Button onClick={onCancel}>Cancel</Button>
          </ButtonGroup>
          <UserAvatarStack label="Notify" pubkeys={notifyPubkeys} />
          <Button type="submit" colorScheme="brand" size="sm" ml="auto">
            Submit
          </Button>
        </Flex>
      </form>
    </UserDirectoryProvider>
  );
}