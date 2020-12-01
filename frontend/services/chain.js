import dock from '@docknetwork/sdk';

let accountStore;
let didStore;

function save() {
  if (accountStore) {
    localStorage.setItem('accountStore', JSON.stringify(accountStore));
  }
  if (didStore) {
    localStorage.setItem('didStore', JSON.stringify(didStore));
  }
}

export function getSavedDIDs() {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  if (!didStore) {
    try {
      didStore = JSON.parse(localStorage.getItem('didStore') || '[]');
    } catch (e) {
      didStore = [];
    }
    save();
  }
  return didStore;
}

export function getChainAccounts() {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  if (!accountStore) {
    try {
      accountStore = JSON.parse(localStorage.getItem('accountStore') || '[]');
    } catch (e) {
      accountStore = [];
    }
    save();
  }
  return accountStore;
}

export function removeDID(did) {
  const accounts = getSavedDIDs();
  const keepAccounts = [];
  while (accounts.length) {
    const account = accounts.pop();
    if (account.id !== did) {
      keepAccounts.push(account);
    }
  }

  accounts.push(...keepAccounts.reverse());
  save();
}

export function removeChainAccount(address) {
  const accounts = getChainAccounts();
  const keepAccounts = [];
  while (accounts.length) {
    const account = accounts.pop();
    if (account.address !== address) {
      keepAccounts.push(account);
    }
  }

  accounts.push(...keepAccounts.reverse());
  save();
}

export function savedAccountToKeyring(value) {
  return value && dock.keyring.addFromUri(value.seed, null, value.type);
}

export function saveDID(id, controller) {
  getSavedDIDs().push({ id, controller });
  save();
}

/*
  TODO: FIXME:
  This is a very insecure way of storing account data
  in interest of time for this demo solution on testnet
  it's fine, but this should be addressed.
*/
export function saveChainAccount(address, seed, type, name) {
  getChainAccounts().push({
    address, seed, type, name,
  });
  save();
}
