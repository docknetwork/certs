import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import dock from '@docknetwork/sdk';

import { createKeyDetail } from '@docknetwork/sdk/utils/did';
import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import { DockResolver, UniversalResolver, MultiResolver } from '@docknetwork/sdk/resolver';

import { getPublicKeyFromKeyringPair } from '@docknetwork/sdk/utils/misc';

import b58 from 'bs58';

import { u8aToString, stringToU8a } from '@polkadot/util';
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

const fieldTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline'];

export function templateFieldsToRef(template) {
  const result = [];

  for (let i = 0; i < template.fields.length; i++) {
    const field = template.fields[i];
    const fieldType = fieldTypes.indexOf(field.type);
    const fieldGutter = field.gutter ? 1 : 0;
    const value = field.jsonField ? `{${field.jsonField}}` : field.default;
    if (value.length >= 255) {
      throw new Error(`Field value too long, max length 255, got length: ${value.length}`);
    }

    const fieldValue = stringToU8a(value);

    result.push(...[
      fieldType,
      fieldGutter,
      fieldValue.length,
      ...fieldValue,
    ]);
  }

  return b58.encode(result);
}

export function fieldsRefToTemplate(ref) {
  const decoded = b58.decode(ref);
  const fields = [];

  let i = 0;
  let x = 0;
  for (i = 0; i < decoded.length; i++) {
    const fieldType = decoded[i + 0];
    const fieldGutter = decoded[i + 1];
    const fieldValueLength = decoded[i + 2];
    const valueBytes = decoded.slice(i + 3, i + 3 + fieldValueLength);

    fields.push({
      value: u8aToString(valueBytes),
      type: fieldTypes[fieldType],
      gutter: !!fieldGutter,
    });

    i += fieldValueLength + 2;
    x++;
  }

  return fields;
}

export function dataToVC(issuerDID, receiver, issuer, issuanceDate, expirationDate, template) {
  // Hardcoded context/type for current one template we support
  const credentialContext = 'https://www.w3.org/2018/credentials/examples/v1';
  const credentialType = template && template.type || 'UniversityDegreeCredential';

  // Create VC object
  const credential = new VerifiableCredential();
  credential.addContext(credentialContext);
  credential.addType(credentialType);

  // Assign recipient as subject
  if (template && receiver) {
    const subjectFields = template && template.fields.map((field) => field.jsonField && {
      jsonField: field.jsonField,
      value: field.default,
    }).filter((element) => element !== undefined);

    const tSubject = {
      name: receiver.name,
      referenceId: templateFieldsToRef(template),
    };

    if (receiver.did) {
      tSubject.id = receiver.did;
    }

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
