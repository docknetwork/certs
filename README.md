Certs ES6 NextJS Frontend
==================================

This is the frontend implementation of Dock's W3C compliant credential issuing solution. It is built with NextJS/React/ES6 leveraging the Dock SDK.


Getting Started
---------------

Create a `.env.local` file with the following contents:

```
NEXT_PUBLIC_MAGIC_PUBLIC_KEY=YOUR_MAGIC_KEY
NEXT_PUBLIC_WSS_NODE_ADDR=wss://your-substrate.node
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
