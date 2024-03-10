import Folder from '../../models/Folder';
import File from '../../models/File';
import PublicLink from '../../models/PublicLink';

export const getFolder = async (id: string | number) => {
  const folder = await Folder.findByPk(id);
  const data = folder.toJSON();
  data.subFolders = await subFolders(id);
  data.files = await subFiles(id);
  // data.publicLinks = await publicLinks(id);
  return data;
};

export const subFolders = async (parentId: string | number) => {
  const folders = await Folder.findAll({ where: { parentId } });
  return folders.map((f) => f.toJSON());
};
export const publicLinks = async (folderId: string | number) => {
  const links = await PublicLink.findAll({ where: { folderId } });
  return links.map((f) => f.toJSON());
};

export const subFiles = async (folderId: string | number) => {
  const files = await File.findAll({ where: { folderId } });
  return files.map((f) => {
    // this was just f.toJSON but all metadata is a single field in the DB currently coz it's 'modular' not 'dodgy'
    return fileToJSON(f);
  });
};

export const fileToJSON = (f: File) => {
  return { ...f.toJSON(), metadata: JSON.parse(f.metadata) };
};
