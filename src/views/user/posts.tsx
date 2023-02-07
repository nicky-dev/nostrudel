import React, { useEffect, useState } from "react";
import { Flex, SkeletonText } from "@chakra-ui/react";
import { useSubscription } from "../../hooks/use-subscription";
import { Post } from "../../components/post";
import { NostrEvent } from "../../types/nostr-event";
import settings from "../../services/settings";
import useSubject from "../../hooks/use-subject";

export const UserPostsTab = ({ pubkey }: { pubkey: string }) => {
  const relays = useSubject(settings.relays);
  const [events, setEvents] = useState<Record<string, NostrEvent>>({});

  const sub = useSubscription(
    relays,
    { authors: [pubkey], kinds: [1] },
    `${pubkey} posts`
  );

  useEffect(() => {
    const s = sub.onEvent.subscribe((event) => {
      setEvents((dir) => {
        if (!dir[event.id]) {
          return { [event.id]: event, ...dir };
        }
        return dir;
      });
    });

    return () => s.unsubscribe();
  }, [sub]);

  // clear events when pubkey changes
  useEffect(() => setEvents({}), [pubkey]);

  const timeline = Object.values(events).sort(
    (a, b) => b.created_at - a.created_at
  );

  if (timeline.length === 0) {
    return <SkeletonText />;
  }

  if (timeline.length > 20) timeline.length = 20;

  return (
    <Flex direction="column" gap="2" pr="2" pl="2">
      {timeline.map((event) => (
        <Post key={event.id} event={event} />
      ))}
    </Flex>
  );
};