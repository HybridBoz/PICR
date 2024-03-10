export interface MinimalFolder {
  id: string;
  name?: string;
  parentId?: string | null | undefined;
  parent?: MinimalFolder | null;
}

export interface MinimalFile {
  id: string;
  name?: string;
  fileHash?: string;
  imageRatio?: number | null;
}
export interface MinimalSharedFolder {
  id: string;
  name?: string;
  uuid?: string;
  enabled?: boolean;
  folder?: MinimalFolder | null;
}
