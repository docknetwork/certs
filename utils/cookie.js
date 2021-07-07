import Iron from '@hapi/iron';

/* defining the cookie attributes */
export const cookie = {
  maxAge: 60 * 60, // 1 hour
  secure: false, // set `true` for https only
  path: '/', // send the cookie on all requests
  httpOnly: true, // makes cookie inaccessible from browser (only transfered through http requests, and protects against XSS attacks)
  sameSite: 'strict', // cookie can only be sent from the same domain
};

export const decryptCookie = async (userCookie) => await Iron.unseal(userCookie, process.env.ENCRYPTION_SECRET, Iron.defaults);
export const encryptCookie = async (userMetadata) => await Iron.seal(userMetadata, process.env.ENCRYPTION_SECRET, Iron.defaults);
