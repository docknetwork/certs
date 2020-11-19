import resource from 'resource-router-middleware';
import Receiver from '../models/receiver';
import { getUser } from '../utils/user';

function emailIsValid(email) {
  return (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email));
}

export default ({ config, db }) => resource({
	id: 'receiver',

	async index(req, res, next) {
    const user = await getUser(req);
    const issuer = user._id;
    try {
      const result = await Receiver.find({
        issuer,
      });
      res.send(result);
    } catch (e) {
      next(e);
    }
	},

	/** POST / - Create a new entity */
	async create(req, res, next) {
    const user = await getUser(req);
    const body = req.body;
    const issuer = user._id;
    const receiver = body;

    // email validation
    if (!body.receiverEmail || !emailIsValid(body.receiverEmail)) {
      throw new Error('Invalid email');
    }

    // check if receiver exists by ref
    let existingReceiver = await Receiver.findOne({ issuer, reference: receiver.receiverRef });

    // check if receiver exists by email
    if (!existingReceiver && receiver.receiverEmail) {
      existingReceiver = await Receiver.findOne({ issuer, email: receiver.receiverEmail });
    }

    let receiverDID = receiver.receiverDID;
    if (existingReceiver && !existingReceiver.did) {
      // TODO: search database receivers to see if one exists with a DID registered
      // under the same email address. if so, populate the DID for this existing receiver with that one
      // this will sync receiver DIDs if they register them
    }

    if (existingReceiver) {
      // update existing receiver info
      await Receiver.findOneAndUpdate({ _id: existingReceiver._id }, {
        name: receiver.receiverName,
        email: receiver.receiverEmail,
        reference: receiver.receiverRef,
        did: receiverDID,
      }, {upsert: true});

      // existingReceiver
    } else {
      // register new receiver
      existingReceiver = await new Receiver({
        name: receiver.receiverName,
        reference: receiver.receiverRef,
        email: receiver.receiverEmail,
        did: receiverDID,
        issuer,
      }).save();
    }

    existingReceiver = await Receiver.findOne({ _id: existingReceiver._id });

    res.send(existingReceiver);
  },

	/** DELETE /:id - Delete a given entity */
	async delete(req, res, next) {
    const user = await getUser(req);
    const receivers = req.body.receivers;

    if (receivers.length) {
      await Receiver.deleteMany({
        _id: {
          $in: receivers
        },
        issuer: user._id,
      });
    }

		res.send({ done: true });
	}
});
