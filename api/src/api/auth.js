import { Magic } from '@magic-sdk/admin';
import { serialize } from 'cookie';
import User from '../models/user';

import { encryptCookie, cookie } from '../utils/cookie';

require('dotenv').config();

/* save new user to database */
const signup = async (user) => {
  const newUser = {
    email: user.email,
    issuer: user.issuer,
  };
  const result = await new User(newUser).save();
  return result;
};

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

export default async (req, res, next) => {
  try {
    if (req.method !== 'POST') return res.status(405).end();

    // Exchange the DID from Magic for some user data
    const did = magic.utils.parseAuthorizationHeader(req.headers.authorization);

    /* validate token to ensure request came from the issuer */
    await magic.token.validate(did);

    /* decode token to get claim obj with data */
    const claim = magic.token.decode(did)[1];

    /* get user data from Magic */
    const userMetadata = await magic.users.getMetadataByIssuer(claim.iss);

    /* check if user is already in */
    const existingUser = await User.findOne({ issuer: claim.iss });

    /* Create new user if doesn't exist */
    let returnUser = existingUser;
    if (!existingUser) {
      returnUser = await signup(userMetadata);
    }

    /* check if user is already in */
    const signed = await User.findOne({ issuer: claim.iss });
    if (!signed) {
      throw new Error('Unable to sign up user');
    }

    /* encrypted cookie details */
    const token = await encryptCookie(userMetadata);

    /* set cookie */
    await res.setHeader('Set-Cookie', serialize('auth', token, cookie));

    res.json({
      authorized: true,
      new: !existingUser,
      token,
      user: returnUser,
    });
  } catch (err) {
    next(err);
  }
};
