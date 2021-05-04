import { UserItem } from '@slater-notes/core';
import { FileCollection } from '../types/notes';
import { StandardResponse } from '../types/response';
import saveAccountToCloudSync from './saveAccountToCloudSync';
import saveNotesToCloudSyncFromDisk from './saveNotesToCloudSyncFromDisk';

interface Payload {
  user: UserItem;
  noteIds: string[];
  fileCollection: FileCollection;
  fileCollectionNonce: string;
  sessionToken: string;
  passwordKey: CryptoKey;
  cloudSyncPasswordKey: CryptoKey;
}

/**
 * Push fileCollection and noteData to cloud sync.
 */
const saveNotesToCloudSync = async (payload: Payload): Promise<StandardResponse> => {
  const results = await Promise.all([
    saveAccountToCloudSync({
      user: payload.user,
      fileCollection: payload.fileCollection,
      fileCollectionNonce: payload.fileCollectionNonce,
      sessionToken: payload.sessionToken,
      passwordKey: payload.passwordKey,
      cloudSyncPasswordKey: payload.cloudSyncPasswordKey,
    }),
    saveNotesToCloudSyncFromDisk({
      username: payload.user.username,
      sessionToken: payload.sessionToken,
      noteIds: payload.noteIds,
    }),
  ]);

  for (const result of results) {
    if ('error' in result) return result;
  }

  return results[0];
};

export default saveNotesToCloudSync;
