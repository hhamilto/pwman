# PWMAN
## (PassWord MANager)

The broad strokes
- Manages passwords
- Is a firefox extension (under `browser`)
- Backend is Node.js express app (under `server`)
- Passwords are stored unencrypted in mysql (table structure in `server/sql.sql`)

# Getting started

1. Create a mysql database
2. Execute the table create sql file `server/sql.sql` against your db to setup the tables
3. Copy `server/envs/example.env` to `server/envs/dev.env` then fill it out and SOURCE the file
4. Run `node server/index.js`
5. Load the extension in to firefox by following the steps [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#installing). The extension is inside the `browser` directory
6. Curl to create your user so you can login via the extension: `curl -X POST 'http://localhost:3000/users' -H 'content-type: application/json' -d '{"username":"foo","password":"bar"}'`


# FAQs

## Q: Why aren't the passwords encrypted in mysql?
A: Passwords are stored unencrypted in mysql because the complexity outweighs any benefit.
If we encrypted the passwords, we would need to have a key to decrypt them, which
would need to be stored somewhere. Without adding additional dependencies like a key store service,
the only place to store the key is in the mysql database alongside the passwords, which renders the
encryption moot.

