import { Divider, makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { FolderItem, NoteItem } from '@slater-notes/core';
import { MenuItemObject } from '../../../components/Menus/SimpleTextMenu';
import Tag from '../../../components/Tag';
import { useStoreActions, useStoreState } from '../../../stores/mainStore/typedHooks';
import moment from 'moment';

interface Props {
  noteItem: NoteItem;
  onChange: () => void;
}

const FolderPicker = (props: Props) => {
  const classes = useStyles();

  const [folder, setFolder] = useState<FolderItem | null | undefined>(null);

  const fileCollection = useStoreState((s) => s.fileCollection);
  const updateNoteItem = useStoreActions((s) => s.updateNoteItem);

  const getFolderItemFromId = (id: string): FolderItem | undefined =>
    fileCollection?.folders.find((f) => f.id === id);

  useEffect(
    () => {
      setFolder(props.noteItem.parentId ? getFolderItemFromId(props.noteItem.parentId) : null);
    },
    // eslint-disable-next-line
    [props.noteItem.parentId],
  );

  const updateFolder = (payload: FolderItem | null) => {
    setFolder(payload);

    const noteItem = props.noteItem;
    if (payload) {
      noteItem.parentId = payload.id;
    } else {
      delete noteItem.parentId;
    }

    noteItem.updated = moment().unix();

    updateNoteItem({ id: noteItem.id, noteItem });

    props.onChange();
  };

  return (
    <span>
      {useMemo(() => {
        const items: MenuItemObject[] =
          fileCollection && fileCollection.folders.length > 0
            ? fileCollection.folders
                .filter((f) => !f.isDeleted)
                .map((folder) => ({
                  label: folder.title || 'Untitled',
                  isSelected: folder.id === props.noteItem.parentId,
                  onClick: () => {
                    updateFolder(folder);
                  },
                }))
            : [];

        items.unshift({
          replacementLabel: (
            <Typography display='block' variant='caption'>
              Save note to...
            </Typography>
          ),
        });

        if (props.noteItem.parentId) {
          items.unshift({
            replacementLabel: <Divider />,
          });

          items.unshift({
            label: <span className={classes.removeFromFolderText}>Remove From Folder</span>,
            onClick: () => updateFolder(null),
          });
        }

        return (
          <div className={classes.container}>
            <Tag
              text={folder ? folder.title || 'Untitled' : 'Save to folder...'}
              color={folder ? 'primary' : undefined}
              menuItems={items}
              onDelete={props.noteItem.parentId ? () => updateFolder(null) : undefined}
            />
          </div>
        );
        // eslint-disable-next-line
      }, [fileCollection, props.noteItem, props.noteItem.parentId, folder])}
    </span>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
  },

  removeFromFolderText: {
    color: theme.palette.error.main,
  },
}));

export default FolderPicker;
