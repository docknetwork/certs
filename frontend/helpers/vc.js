import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import dock from '@docknetwork/sdk';

import { createKeyDetail } from '@docknetwork/sdk/utils/did';
import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import { DockResolver, UniversalResolver, MultiResolver } from '@docknetwork/sdk/resolver';

import { getPublicKeyFromKeyringPair } from '@docknetwork/sdk/utils/misc';

import { getChainAccounts } from '../services/chain';

// Setup resolvers
const resolvers = {
  dock: new DockResolver(dock),
};

const universalResolverUrl = 'https://uniresolver.io';
const resolver = new MultiResolver(resolvers, new UniversalResolver(universalResolverUrl));

export async function ensureConnection() {
  if (!dock.isConnected) {
    await dock.init({
      address: process.env.NEXT_PUBLIC_WSS_NODE_ADDR,
    });
  }
}

export async function ensureKeyring() {
  if (!dock.keyring) {
    await dock.initKeyring();
  }
}

export function getKeyDetail(did, pair) {
  const publicKey = getPublicKeyFromKeyringPair(pair);
  const keyDetail = createKeyDetail(publicKey, did);
  return keyDetail;
}

export async function registerNewDIDUsingPair(did, pair) {
  await ensureConnection();
  const keyDetail = getKeyDetail(did, pair);
  return dock.did.new(did, keyDetail, false);
}

export function dataToVC(issuerDID, receiver, issuer, issuanceDate, expirationDate, template) {
  // Hardcoded context/type for current one template we support
  const credentialContext = 'https://www.w3.org/2018/credentials/examples/v1';
  const credentialType = 'AlumniCredential';

  // Create VC object
  const credential = new VerifiableCredential();
  credential.addContext(credentialContext);
  credential.addType(credentialType);

  // Assign recipient as subject
  if (receiver) {
    const subjectFields = template && template.fields.map(field => {
      return field.jsonField && {
        jsonField: field.jsonField,
        value: field.default,
      }
    }).filter(element => {
      return element !== undefined;
    });

    const tSubject = {
      id: receiver.did || receiver._id,
      name: receiver.name,
      referenceId: receiver._id,
    };

    if (subjectFields) {
      for (let i = 0; i < subjectFields.length; i++) {
        const field = subjectFields[i];
        tSubject[field.jsonField] = field.value;
      }
    }

    credential.addSubject(tSubject);
  }
  credential.setIssuanceDate(typeof issuanceDate.toISOString === 'function' ? issuanceDate.toISOString() : issuanceDate);
  credential.setExpirationDate(typeof expirationDate.toISOString === 'function' ? expirationDate.toISOString() : expirationDate);
  credential.setIssuer(issuerDID);
  return credential;
}

export async function verifyVC(credential) {
  await ensureConnection();

  const vc = credential.toJSON ? credential : VerifiableCredential.fromJSON(credential);
  const result = await vc.verify({
    resolver,
    compactProof: true,
  });
  return result;
}

// Gets a keypair by address using saved data
export async function getKeypairByAddress(address) {
  await ensureKeyring();

  // Check for keypair in saved accounts
  const savedAccounts = getChainAccounts();
  for (let i = 0; i < savedAccounts.length; i++) {
    const account = savedAccounts[i];
    if (account.address === address) {
      return dock.keyring.addFromUri(account.seed, null, account.type);
    }
  }

  return null;
}

export async function signVC(credential, issuerDID, controllerAccount) {
  await ensureKeyring();

  const type = 'Sr25519VerificationKey2020'; // TODO: dervice type from controllerAccount type
  const issuerKey = getKeyDoc(issuerDID, controllerAccount, type);
  const signedCredential = await credential.sign(issuerKey);
  return signedCredential;
}
