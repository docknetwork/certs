import getUser from '../utils/user';
import Credential from '../models/credential';
import Receiver from '../models/receiver';
import CredentialTemplate from '../models/credential-type';

export default async (req, res, next) => {
  try {
    const user = await getUser(req);
    const templates = await CredentialTemplate.countDocuments({ creator: user._id });
    const credentials = await Credential.countDocuments({ creator: user._id });
    const receivers = await Receiver.countDocuments({ issuer: user._id });
    return res.json({
      templates,
      credentials,
      receivers,
    });
  } catch (err) {
    next(err);
  }
};
