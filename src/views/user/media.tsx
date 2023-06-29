import { useEffect, useMemo } from "react";
import { Box, Button, Flex, Grid, IconButton, Spinner } from "@chakra-ui/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useMount, useUnmount } from "react-use";
import { useAdditionalRelayContext } from "../../providers/additional-relay-context";
import { matchImageUrls } from "../../helpers/regexp";
import { useIsMobile } from "../../hooks/use-is-mobile";
import { ImageGalleryLink, ImageGalleryProvider } from "../../components/image-gallery";
import { ExternalLinkIcon } from "../../components/icons";
import { getSharableNoteId } from "../../helpers/nip19";
import useSubject from "../../hooks/use-subject";
import userTimelineService from "../../services/user-timeline";

const matchAllImages = new RegExp(matchImageUrls, "ig");

const UserMediaTab = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { pubkey } = useOutletContext() as { pubkey: string };
  const contextRelays = useAdditionalRelayContext();

  const timeline = useMemo(() => userTimelineService.getTimeline(pubkey), [pubkey]);

  const events = useSubject(timeline.events);
  const loading = useSubject(timeline.loading);

  const filteredEvents = useMemo(() => events.filter((e) => e.kind === 1), [events]);

  useEffect(() => {
    timeline.setRelays(contextRelays);
  }, [timeline, contextRelays.join("|")]);

  useMount(() => timeline.open());
  useUnmount(() => timeline.close());

  const images = useMemo(() => {
    var images: { eventId: string; src: string; index: number }[] = [];

    for (const event of filteredEvents) {
      const urls = event.content.matchAll(matchAllImages);

      let i = 0;
      for (const url of urls) {
        images.push({ eventId: event.id, src: url[0], index: i++ });
      }
    }

    return images;
  }, [filteredEvents]);

  return (
    <Flex direction="column" gap="2" px="2" pb="8" h="full" overflowY="auto">
      <ImageGalleryProvider>
        <Grid templateColumns={`repeat(${isMobile ? 2 : 5}, 1fr)`} gap="4">
          {images.map((image) => (
            <ImageGalleryLink key={image.eventId + "-" + image.index} href={image.src} position="relative">
              <Box
                aspectRatio={1}
                backgroundImage={`url(${image.src})`}
                backgroundSize="cover"
                backgroundPosition="center"
              />
              <IconButton
                icon={<ExternalLinkIcon />}
                aria-label="Open note"
                position="absolute"
                right="2"
                top="2"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/n/${getSharableNoteId(image.eventId)}`);
                }}
              />
            </ImageGalleryLink>
          ))}
        </Grid>
      </ImageGalleryProvider>
      {loading ? (
        <Spinner ml="auto" mr="auto" mt="8" mb="8" flexShrink={0} />
      ) : (
        <Button onClick={() => timeline.loadMore()} flexShrink={0}>
          Load More
        </Button>
      )}
    </Flex>
  );
};

export default UserMediaTab;