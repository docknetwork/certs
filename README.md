Dock Certs
==================================

This is an example implementation of a W3C compliant credential issuing solution leverage Dock's technology. It is built with NextJS/React/ES6 leveraging the Dock SDK.


Getting Started
---------------

Create a `.env.local` file with the following contents:

```
NEXT_PUBLIC_MAGIC_PUBLIC_KEY=YOUR_MAGIC_KEY
NEXT_PUBLIC_WSS_NODE_ADDR=wss://your-substrate.node

ENCRYPTION_SECRET=32charenc
MAGIC_SECRET_KEY=magicauthsecretkey
MONGO_URI=mongoconnectiouri
MONGO_PASS=mongopassword
MONGO_DBNAME=mongodatabase
FAUCET_ACCOUNT_SEED=faucet seed
FAUCET_ACCOUNT_TYPE=sr25519
FAUCET_DRIP_AMOUNT=500000000

```

Then run:
```
yarn install
```

And to start a development environment:
```
yarn dev
```

Starting a production server:
```
yarn start
```

Static export:
```
yarn build && yarn export
```

Linting: `yarn lint`
