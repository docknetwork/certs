import { decryptCookie } from './cookie';
import User from '../models/user';

export async function getUser(req) {
    const authToken = (req.cookies && req.cookies.auth) || req.headers.authorization;
    if (!authToken) {
      throw new Error(`No auth token`);
    }

    /**
     * `user` will be on the form of:
     * {
     * issuer: 'did:ethr:0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
     * publicAddress: '0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
     * email: 'example@gmail.com'
     * }
     */
    const user = await decryptCookie(authToken);
    const existingUser = await User.findOne({ issuer: user.issuer, email: user.email });
    if (existingUser) {
      return existingUser;
    } else {
      throw new Error('No such user');
    }
}
