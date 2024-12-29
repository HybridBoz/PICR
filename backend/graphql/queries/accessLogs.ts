import { contextPermissions } from '../../auth/contextPermissions';
import { GraphQLError } from 'graphql/error';
import Folder from '../../models/Folder';
import { Op } from 'sequelize';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { allSubFoldersRecursive } from '../../helpers/allSubFoldersRecursive';
import AccessLogModel from '../../models/AccessLogModel';
import { accessLogType } from '../types/accessLogType';
import { userTypeEnum } from '../enums/userTypeEnum';
import { addFolderRelationship } from '../helpers/addFolderRelationship';
import { UserType } from '../../../graphql-types';
import User from '../../models/User';

const resolver = async (_, params, context) => {
  const { folder } = await contextPermissions(
    context,
    params.folderId,
    'Admin',
  );

  const ids = [folder.id];

  if (params.includeChildren) {
    const children = await allSubFoldersRecursive(folder.id);
    const childIds = children.map(({ id }) => id);
    ids.push(...childIds);
  }

  //TODO: property filter by UserType, currently we force filter for Links which is fine for now
  // if(params.userType == UserType.Link) {
  //
  // }

  const userIds = (
    await User.findAll({
      where: { uuid: { [Op.ne]: null } },
    })
  ).map((u) => u.id);

  const data = await AccessLogModel.findAll({
    where: {
      folderId: { [Op.or]: ids },
      userId: params.userId ?? { [Op.or]: userIds },
    },
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
  return addFolderRelationship(
    data.map((al) => {
      return { ...al.toJSON(), timestamp: al.createdAt };
    }),
  );
};

export const accessLogs = {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(accessLogType))),
  resolve: resolver,
  args: {
    folderId: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLID },
    includeChildren: { type: GraphQLBoolean },
    userType: { type: userTypeEnum },
  },
};
