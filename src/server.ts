import express from 'express';
import { sequelize } from './database';
import pkg from '../package.json';
import { fileWatcher } from './filesystem/fileWatcher';
import { config } from 'dotenv';
import { gqlserver } from './graphql/gql';
import { logger } from './logger';
import { randomBytes } from 'node:crypto';
import { generateAccessToken } from './auth/auth';
import path from 'path';
import { User } from './models/user';
import { Folder } from './models/folder';
import { hashPassword } from './helpers/hashPassword';

const envPassword = async () => {
  const password = process.env.ADMIN_PASSWORD;
  const totalUsers = await User.count();
  // if (totalUsers == 0 && !password) {
  //   console.log(
  //     `ERROR: You haven't specified an ADMIN_PASSWORD in .ENV and you don't have any user accounts in the database`,
  //   );
  //   process.exit();
  // }
  if (totalUsers == 0) {
    const admin = User.create({
      username: 'admin',
      hashedPassword: hashPassword('password'),
    });
    console.log(
      '🔐 No users found so "admin" user created with password "password"',
    );
  }
};

const envSecret = async () => {
  if (!process.env.TOKEN_SECRET) {
    const secret = randomBytes(64).toString('hex');
    console.log(`ERROR: You haven't specified a TOKEN_SECRET in .ENV
Heres one we just created for you:
TOKEN_SECRET=${secret}`);
    process.exit();
  }
};

const server = async () => {
  config(); // read .ENV
  await envSecret();
  await envPassword();

  await sequelize.sync({}); // build DB

  const e = express();
  const port = 6900;
  const appName = pkg.name;

  e.all('/graphql', gqlserver);
  e.use(express.static('public'));

  e.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  });

  e.listen(port, () => {
    logger(`🌐 App listening at http://localhost:${port}`);
  });

  //Close all the stuff
  process.on('exit', function () {
    sequelize.close().then(() => {
      console.log(`💀 ${appName} Closed`);
    });
  });

  // This is CTRL+C While it's running, trigger a nice shutdown
  process.on('SIGINT', function () {
    console.log(`❌ Shutting down ${appName}`);
    process.exit(0);
  });

  fileWatcher();
};

server();
