import dock from '@docknetwork/sdk';

async function requestBalance(dock, address) {
  const transfer = api.tx.balances.transfer(address, process.env.FAUCET_DRIP_AMOUNT);
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

    if (!dock.isConnected) {
      await dock.init({
        address: nodeAddress,
      });

      const account = dock.keyring.addFromUri(faucetAccountSeed, null, faucetAccountType);
      dock.setAccount(account);

      // Subscribe to block results to avoid connection timeouts
      const unsub = await dock.api.query.timestamp.now((moment) => {
        console.log(`The last block has a timestamp of ${moment}`);
      });
    }

    const accountData = await dock.api.query.system.account(address);
    if (accountData.data.free.toNumber() === 0) {
      // try request balance
      try {
        await requestBalance(dock, address);
      } catch (e) { // try once more
        await requestBalance(dock, address);
      }
    }

    return res.json({
      address,
    });
  } catch (err) {
    next(err);
  }
};
