#!/bin/bash
mongosh -- "$MONGO_INITDB_DATABASE" <<EOF
db.createUser({
  user: 'admin',
  pwd: 'password',
  roles: [
    { role: 'readWrite', db: 'admin' }
  ]
});
EOF
