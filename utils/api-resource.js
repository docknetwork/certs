import connectToDB from './db';

const methodToTypes = {
  'GET': 'index',
  'POST': 'create',
  'PUT': 'update',
  'DELETE': 'delete',
};

export default function resource(route) {
  return async function(req, res) {
    await connectToDB();
    const { method } = req;

    let requestType = methodToTypes[method];
    if (requestType === 'index') {
      if (req.query.id) {
        requestType = 'read';
      }
    }

    await route[requestType](req, res, function(err) {
      res.status(400).json({ error: err.toString() });
    });
  };
}
