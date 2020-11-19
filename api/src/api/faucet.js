import { getUser } from '../utils/user';
import Credential from '../models/credential';
import Receiver from '../models/receiver';
import CredentialTemplate from '../models/credential-type';

import {DockAPI} from '@docknetwork/sdk';

export default async (req, res, next) => {
  try {
    const user = await getUser(req);
    const { address, nodeAddress } = req.body;
    if (!address) {
      throw new Error('No address!');
    }

    const faucetAccountSeed = process.env.FAUCET_ACCOUNT_SEED;
    const faucetAccountType = process.env.FAUCET_ACCOUNT_TYPE;
    const dock = new DockAPI();

    await dock.init({
      address: nodeAddress
    });

    const account = dock.keyring.addFromUri(faucetAccountSeed, null, faucetAccountType);
    dock.setAccount(account);

    // Ensure balance for address is 0
    const accountData = await dock.api.query.system.account(address);
    if (accountData.data.free == 0) {
      async function requestBalance() {
        const transfer = dock.api.tx.sudo.sudo(dock.api.tx.balances.setBalance(address, process.env.FAUCET_DRIP_AMOUNT, 0));
        await dock.signAndSend(transfer, false);
      }

      // try request balance
      try {
        await requestBalance();
      } catch (e) { // try once more
        await requestBalance();
      }
    }

    dock.disconnect();

    return res.json({
      address,
    });
  } catch (err) {
    next(err)
  }
};
