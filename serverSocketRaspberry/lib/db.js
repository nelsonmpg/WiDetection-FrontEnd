/* global module */

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
 * Verfica se existe a base de dados e as tabelas se não cronstroi-as
 * @returns {undefined}
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
 * Consultsa a base dedados se o utilizador existe e se e o correto
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
 * Regista o novo utili<zador
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.registeruser = function (req, res) {
  r.connect(self.dbData).then(function (conn) {
    return r.db("user").table("users").filter({"email": req.body.email}).count().do(function (valor) {
      return r.branch(valor.eq(0),
              r.db("user").table("users").insert({"email": req.body.email, "fullname": req.body.fullname, "pass": req.body.pass, "logo": ""}),
              false)
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
