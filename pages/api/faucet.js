import axios from 'axios';

export default async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      throw new Error('No address!');
    }

    const { data } = await axios.post('https://faucet.dock.io/api/faucet', {
      token: process.env.CAPTCHA_BYPASS_TOKEN,
      address,
    });

    res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({
      error: err.toString(),
    });
  }
};
