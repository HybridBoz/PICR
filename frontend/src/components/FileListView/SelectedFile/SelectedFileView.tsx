// The "Lightbox" appears when an individual image is selected
import { ControllerRef, Lightbox } from 'yet-another-react-lightbox';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { FileListViewStyleComponentProps } from '../FolderContentsView';
import { theme } from '../../../theme';
import { useSetFolder } from '../../../hooks/useSetFolder';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { LightboxFileRating } from './LightboxFileRating';
import { filesForLightbox } from './filesForLightbox';
import { LightboxInfoButton } from './LightboxInfoButton';
import { lightboxPlugins } from './lightboxPlugins';

export const SelectedFileView = ({
  files,
  selectedFileId,
  setSelectedFileId,
  folderId,
}: FileListViewStyleComponentProps) => {
  const selectedImageIndex = files.findIndex(({ id }) => id === selectedFileId);
  const selectedImage = files.find(({ id }) => id === selectedFileId);
  const ref = useRef<ControllerRef>(null);
  const { fileId, fileView } = useParams();

  // set focus to Lightbox if there isn't a popup sub-view
  // EG: when closing metadata popup this will reallow left/right keyboard keys to change slides
  useEffect(() => {
    if (!fileView) {
      console.log('set focus on lightbox');
      ref.current?.focus();
    }
  }, [fileView, ref.current]);

  const setFolder = useSetFolder();

  const toolbarButtons = [
    'download',
    <LightboxInfoButton file={selectedImage} />,
    'slideshow',
    'close',
  ];

  return (
    <Lightbox
      controller={{ ref }}
      plugins={lightboxPlugins}
      counter={counterProps}
      slides={filesForLightbox(files)}
      open={!!selectedFileId}
      index={selectedImageIndex}
      close={() => setSelectedFileId(undefined)}
      styles={lightBoxStyles}
      video={videoProps}
      toolbar={{ buttons: toolbarButtons }}
      render={{
        slideFooter: ({ slide }) => (
          <LightboxFileRating slide={slide} selected={selectedImage} />
        ),
      }}
      thumbnails={{ position: 'bottom' }}
      on={{
        view: ({ index }) => {
          const f = files[index];
          // don't change URL if we are already on that URL (IE: first opening gallery)
          if (f.id != fileId) {
            setFolder({ id: folderId }, f);
          }
        },
      }}
    />
  );
};

const lightBoxStyles = {
  root: { fontFamily: theme.fontFamily, zIndex: 100 },
};

const counterProps = { container: { style: { top: 'unset', bottom: 0 } } };
const videoProps = { autoPlay: true, muted: false };
