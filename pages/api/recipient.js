import Credential from '../../models/credential';
import connectToDB from '../../utils/db';

export default async (req, res, next) => {
  await connectToDB();
  const { reference } = req.body;
  const query = Credential.find({
    recipientReference: reference,
  }).sort({ created: 'desc' }).populate('template').populate('receiver');
  const result = await query.exec();
  res.send(result);
};
