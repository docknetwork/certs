import { DockAPI } from '@docknetwork/sdk';

async function requestBalance(dock, address) {
  const transfer = dock.api.tx.sudo.sudo(dock.api.tx.balances.setBalance(address, process.env.FAUCET_DRIP_AMOUNT, 0));
  await dock.signAndSend(transfer, false);
}

export default async (req, res, next) => {
  try {
    const { address, nodeAddress } = req.body;
    if (!address) {
      throw new Error('No address!');
    }

    const faucetAccountSeed = process.env.FAUCET_ACCOUNT_SEED;
    const faucetAccountType = process.env.FAUCET_ACCOUNT_TYPE;
    const dock = new DockAPI();

    await dock.init({
      address: nodeAddress,
    });

    const account = dock.keyring.addFromUri(faucetAccountSeed, null, faucetAccountType);
    dock.setAccount(account);

    const accountData = await dock.api.query.system.account(address);
    if (accountData.data.free === 0) {
      // try request balance
      try {
        await requestBalance(dock, address);
      } catch (e) { // try once more
        await requestBalance(dock, address);
      }
    }

    dock.disconnect();

    return res.json({
      address,
    });
  } catch (err) {
    next(err);
  }
};
