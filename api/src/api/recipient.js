import Credential from '../models/credential';
import Receiver from '../models/receiver';

export default async (req, res, next) => {
  try {
    const { reference } = req.body;
    const query = Credential.find({
      recipientReference: reference,
    }).sort({ created: 'desc' }).populate('template').populate('receiver');
    const result = await query.exec();
    res.send(result);
  } catch (err) {
    next(err);
  }
};
