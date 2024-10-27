import { Button, ButtonProps } from '@mantine/core';
import { copyToClipboard, publicURLFor } from '../../helpers/copyToClipboard';
import { notifications } from '@mantine/notifications';
import { ClipboardIcon } from '../../PicrIcons';
import { TbClipboard } from 'react-icons/tb';

export const CopyPublicLinkButton = ({
  disabled,
  hash,
  folderId,
  ...props
}: {
  disabled: boolean;
  hash: string;
  folderId: number;
} & ButtonProps) => {
  const url = publicURLFor(hash, folderId);
  const notif = {
    title: 'Link copied to clipboard',
    message: url,
    icon: <ClipboardIcon />,
  };
  return (
    <Button
      {...props}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        copyToClipboard(url);
        notifications.show(notif);
      }}
    >
      <TbClipboard />
      Copy Link
    </Button>
  );
};
