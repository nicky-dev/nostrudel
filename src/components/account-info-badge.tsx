import { Badge, BadgeProps } from "@chakra-ui/react";
import { Account } from "../services/account";

export default function AccountInfoBadge({ account, ...props }: BadgeProps & { account: Account }) {
  if (account.useExtension) {
    return (
      <Badge {...props} variant="solid" colorScheme="green">
        extension
      </Badge>
    );
  }
  if (account.secKey) {
    return (
      <Badge {...props} variant="solid" colorScheme="red">
        nsec
      </Badge>
    );
  }
  if (account.readonly) {
    return (
      <Badge {...props} variant="solid" colorScheme="blue">
        read-only
      </Badge>
    );
  }
  return null;
}
