import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { User } from '../../modules/users/user.entity';
import { Post } from '../../modules/forum/post.entity';
import { Category } from '../../modules/forum/category.entity';
import { Comment } from '../../modules/forum/comment.entity';
import { Favorite } from '../../modules/forum/favorite.entity';

export const databaseProvider = [
  {
    provide: SEQUELIZE,
    useFactory: async () => {
      let config;
      let forceSync = true;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;

          config.dialectOptions = {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          };

          forceSync = false;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize(config);
      sequelize.addModels([User, Category, Post, Comment, Favorite]);
      await sequelize.sync({ force: forceSync });
      return sequelize;
    },
  },
];
