import resource from 'resource-router-middleware';
import CredentialTemplate from '../models/credential-type';
import { getUser } from '../utils/user';

export default ({ config, db }) => resource({
	id : 'template',

	async index(req, res, next) {
    const user = await getUser(req);
    const creator = user._id;
    try {
      const result = await CredentialTemplate.find({
        creator,
      });
      res.send(result);
    } catch (e) {
      next(e);
    }
	},

	async update(req, res) {
    const user = await getUser(req);
    const body = req.body;
    const creator = user._id;
    try {
      await CredentialTemplate.findOneAndUpdate({ _id: req.params.template, creator }, {
        ...body,
      }, {upsert: true});
  		res.send({ done: true });
    } catch (e) {
      next(e);
    }
	},

	async create(req, res, next) {
    const user = await getUser(req);
    const body = req.body;
    const creator = user._id;
    CredentialTemplate.create({
      ...body,
      creator,
    }, (err, result) => {
      if (err) {
        const error = new Error(err.message);
        next(error);
      } else {
        res.send(result);
      }
    });
	},
});
