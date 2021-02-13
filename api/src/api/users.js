import resource from 'resource-router-middleware';
import getUser from '../utils/user';
import insertSheetRow from '../utils/gsheets';
import User from '../models/user';

export default () => resource({
  id: 'user',

  async index(req, res, next) {
    try {
      const user = await getUser(req);
      if (user) {
        return res.json({ authorized: true, user });
      }
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const user = await getUser(req);
      if (user) {
        const {
          entityName, name, sector, role,
        } = req.body;
        if (!entityName || !name || !sector || !role) {
          throw new Error('Please enter entity name, name, sector and role');
        }

        insertSheetRow(name, entityName, sector, user.email, role);
        await User.findOneAndUpdate({ _id: user._id }, {
          entityName,
          name,
          sector,
        }, { upsert: true });
        return res.json({ updated: true });
      }
    } catch (err) {
      next(err);
    }
  },
});
