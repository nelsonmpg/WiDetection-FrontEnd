/* global module */

// A fork of the [node.js chat app](https://github.com/eiriksm/chat-test-2k) 
// by [@orkj](https://twitter.com/orkj) using socket.io, rethinkdb, passport and bcrypt on an express app.
//
// See the [GitHub README](https://github.com/rethinkdb/rethinkdb-example-nodejs-chat/blob/master/README.md)
// for details of the complete stack, installation, and running the app.

var r = require('rethinkdb');
var connectdb = require('./ConnectDb.js');
// #### Connection details

// RethinkDB database settings. Defaults can be overridden using environment variables.
var dbConfig = {
  db: 'user',
  tables: {
    'users': 'id'
  }
};

var self = this;

/**
 * Connect to RethinkDB instance and perform a basic database setup:
 *
 * - create the `RDB_DB` database (defaults to `chat`)
 * - create tables `messages`, `cache`, `users` in this database
 */
module.exports.setup = function () {
  r.connect(self.dbData).then(function (connection) {
    r.dbCreate(dbConfig.db).run(connection, function (err, result) {
      if (err) {
        console.log("[DEBUG] RethinkDB database '%s' already exists (%s:%s)\n%s", dbConfig.db, err.name, err.msg, err.message);
      } else {
        console.log("[INFO ] RethinkDB database '%s' created", dbConfig.db);
      }
      for (var tbl in dbConfig.tables) {
        (function (tableName) {
          r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function (err, result) {
            if (err) {
              console.log("ERROR: %s:%s", err.name, err.msg);
            } else {
              console.log("[INFO ] RethinkDB table '%s' created", tableName);
            }
          });
        })(tbl);
      }
    });
  });
};

/**
 * Query para o login do user 
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.loginUser = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db("user").table("users")
            .filter({"email": req.body.email})
            .filter({"pass": req.body.pass})
            .withFields("id", "fullname", "email", "logo")
            .coerceTo("array")
            .run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
    res.send(output);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Register de new user na base de dados
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.registeruser = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db("user").table("users")
            .filter({"email": req.body.email})
            .count()
            .do(function (valor) {
              return r.branch(valor.eq(0),
                      r.db("user")
                      .table("users")
                      .insert({
                        "email": req.body.email,
                        "fullname": req.body.fullname,
                        "pass": req.body.pass,
                        "logo": ""}),
                      false);
            }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
    res.send(output);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};

/**
 * Update do user na dase de dados
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.updateuser = function (req, res) {
  console.log(req.body.oldEmail, req.body.newEmail, req.body.fullname, req.body.pass, req.body.id);
  var mail = (req.body.newEmail == req.body.oldEmail) ? true : req.body.newEmail;
  r.connect(self.dbData).then(function (conn) {
    return r.db("user")
            .table("users")
            .filter({"email": mail})
            .count()
            .do(function (valor) {
              return r.branch(valor.eq(0),
                      r.db("user").table("users")
                      .get(req.body.id)
                      .update({
                        "email": req.body.newEmail,
                        "fullname": req.body.fullname,
                        "pass": req.body.pass,
                        "logo": req.body.img}),
                      false);
            }).run(conn)
            .finally(function () {
              conn.close();
            });
  }).then(function (output) {
    console.log(output);
    res.send(output);
  }).error(function (err) {
    console.log("ERROR: %s:%s", err.name, err.msg);
  });
};