import Credential from '../../models/credential';
import CredentialTemplate from '../../models/credential-type';
import Receiver from '../../models/receiver';
import getUser from '../../utils/user';
import sendEmailTo from '../../utils/email';
import resource from '../../utils/api-resource';

export default resource({
  id: 'credential',

  /** GET /:id - Return a given entity */
  async read(req, res, next) {
    try {
      const credential = await Credential.findOne({ _id: req.query.id });
      if (credential) {
        res.json({
          _id: credential._id,
          template: credential.template,
          credential: credential.credential,
        });
      } else {
        throw new Error('Not found');
      }
    } catch (e) {
      next(e);
    }
  },

  async index(req, res, next) {
    const user = await getUser(req);
    const creator = user._id;
    const { limit = 100000, offset = 0 } = req.query;
    try {
      const query = Credential.find({
        creator,
      })
        .sort({ created: 'desc' })
        .populate('template')
        .populate('receiver')
        .skip(parseInt(offset))
        .limit(parseInt(limit));
      const result = await query.exec();
      res.send(result);
    } catch (e) {
      next(e);
    }
  },

  /** POST / - Create a new entity */
  async create(req, res) {
    const user = await getUser(req);
    const { body } = req;
    const creator = user._id;
    const {
      credential, template, receiver, sendEmail,
    } = body;

    if (!receiver || !template) {
      throw new Error('Missing required arguments');
    }

    const existingTemplate = await CredentialTemplate.findOne({ creator, _id: template });
    if (!existingTemplate) {
      throw new Error(`Template ${template} does not exist for creator ${creator}`);
    }

    // check if receiver exist
    const existingReceiver = await Receiver.findOne({ issuer: creator, _id: receiver });
    if (!existingReceiver) {
      throw new Error(`Receiver ${receiver} does not exist for creator ${creator}`);
    }

    const recipientReference = existingReceiver.reference + creator.toString().substr(creator.toString().length - 4);

    // TODO: verify that the credential is a valid VC
    const insertResult = await Credential.create({
      credential,
      receiver,
      creator,
      template,
      recipientReference,
    });

    if (existingReceiver.email && sendEmail) {
      sendEmailTo(existingReceiver.email, existingReceiver.name, recipientReference, user.entityName);
    }

    const query = Credential.findOne({ _id: insertResult._id }).populate('template').populate('receiver');
    const result = await query.exec();
    res.send(result);
  },
});
