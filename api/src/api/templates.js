import resource from 'resource-router-middleware';
import CredentialTemplate from '../models/credential-type';
import getUser from '../utils/user';

export default () => resource({
  id: 'template',

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

  async update(req, res, next) {
    const user = await getUser(req);
    const { body } = req;
    const creator = user._id;
    try {
      await CredentialTemplate.findOneAndUpdate({ _id: req.params.template, creator }, {
        ...body,
      }, { upsert: true });
      res.send({ done: true });
    } catch (e) {
      next(e);
    }
  },

  async create(req, res, next) {
    const user = await getUser(req);
    const { body } = req;
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

  /** DELETE /:id - Delete a given entity */
  async delete(req, res) {
    const user = await getUser(req);
    const { templates } = req.body;

    if (templates.length) {
      await CredentialTemplate.deleteMany({
        _id: {
          $in: templates,
        },
        creator: user._id,
      });
    }

    res.send({ done: true });
  },
});
