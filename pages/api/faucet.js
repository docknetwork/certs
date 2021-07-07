import dock from '@docknetwork/sdk';
import { ensureConnection } from '../../helpers/vc';

async function requestBalance(dock, address) {
  const amount = process.env.FAUCET_DRIP_AMOUNT.toString();
  console.log('Faucet request balance:', address, amount)
  const transfer = dock.api.tx.balances.transfer(address, amount);
  await dock.signAndSend(transfer, false);
}

export default async (req, res, next) => {
  try {
    const { address } = req.body;
    if (!address) {
      throw new Error('No address!');
    }

    const faucetAccountSeed = process.env.FAUCET_ACCOUNT_SEED;
    const faucetAccountType = process.env.FAUCET_ACCOUNT_TYPE;

    await ensureConnection();

    const account = dock.keyring.addFromUri(faucetAccountSeed, null, faucetAccountType);
    dock.setAccount(account);

    const accountData = await dock.api.query.system.account(address);
    if (accountData.data.free.toNumber() === 0) {
      await requestBalance(dock, address);
    }

    await dock.disconnect();

    return res.json({
      address,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      error: err.toString(),
    });
  }
};
