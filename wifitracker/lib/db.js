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

/**
 * Connect to RethinkDB instance and perform a basic database setup:
 *
 * - create the `RDB_DB` database (defaults to `chat`)
 * - create tables `messages`, `cache`, `users` in this database
 */
module.exports.setup = function () {
  connectdb.onConnect(function (err, connection) {
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

// #### Filtering results

/**
 * Find a user by email using the 
 * [`filter`](http://www.rethinkdb.com/api/javascript/filter/) function. 
 * We are using the simple form of `filter` accepting an object as an argument which
 * is used to perform the matching (in this case the attribute `mail` must be equal to
 * the value provided). 
 *
 * We only need one result back so we use [`limit`](http://www.rethinkdb.com/api/javascript/limit/)
 * to return it (if found). The result is collected with [`next`](http://www.rethinkdb.com/api/javascript/next/)
 * and passed as an array to the callback function. 
 *
 * @param {String} mail
 *    the email of the user that we search for
 *
 * @param {Function} callback
 *    callback invoked after collecting all the results 
 * 
 * @returns {Object} the user if found, `null` otherwise 
 */
module.exports.findUserByEmail = function (mail, callback) {
  connectdb.onConnect(function (err, connection) {
    console.log("[INFO ][%s][findUserByEmail] Login {user: %s, pwd: 'you really thought I'd log it?'}", connection['_id'], mail);

    r.db(dbConfig.db).table('users').filter({'mail': mail}).limit(1).run(connection, function (err, cursor) {
      if (err) {
        logerror("[ERROR][%s][findUserByEmail][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        cursor.next(function (err, row) {
          if (err) {
            logerror("[ERROR][%s][findUserByEmail][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
            callback(err);
          }
          else {
            callback(null, row);
          }
          connection.close();
        });
      }

    });
  });
};

/**
 * Every user document is assigned a unique id when created. Retrieving
 * a document by its id can be done using the
 * [`get`](http://www.rethinkdb.com/api/javascript/get/) function.
 *
 * RethinkDB will use the primary key index to fetch the result.
 *
 * @param {String} userId 
 *    The ID of the user to be retrieved.
 *
 * @param {Function} callback
 *    callback invoked after collecting all the results 
 * 
 * @returns {Object} the user if found, `null` otherwise
 */
module.exports.findUserById = function (userId, callback) {
  connectdb.onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('users').get(userId).run(connection, function (err, result) {
      if (err) {
        logerror("[ERROR][%s][findUserById] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(null, null);
      }
      else {
        callback(null, result);
      }
      connection.close();
    });
  });
};

// #### Retrieving chat messages

/**
 * To find the last `max_results` messages ordered by `timestamp`,
 * we are using [`table`](http://www.rethinkdb.com/api/javascript/table/) to access
 * messages in the table, then we 
 * [`orderBy`](http://www.rethinkdb.com/api/javascript/order_by/) `timestamp` 
 * and instruct the server to return only `max_results` using 
 * [`limit`](http://www.rethinkdb.com/api/javascript/limit/).
 *
 * These operations are chained together and executed on the database. Results
 * are collected with [`toArray`](http://www.rethinkdb.com/api/javascript/toArray)
 * and passed as an array to the callback function. 
 *
 *
 * @param {Number} max_results
 *    Maximum number of results to be retrieved from the db
 *
 * @param {Function} callback
 *    callback invoked after collecting all the results
 *
 * @returns {Array} an array of messages
 */
module.exports.findMessages = function (max_results, callback) {
  connectdb.onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('messages').orderBy(r.desc('timestamp')).limit(max_results).run(connection, function (err, cursor) {
      if (err) {
        logerror("[ERROR][%s][findMessages] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(null, []);
        connection.close();
      }
      else {
        cursor.toArray(function (err, results) {
          if (err) {
            logerror("[ERROR][%s][findMessages][toArray] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
            callback(null, []);
          }
          else {
            callback(null, results);
          }
          connection.close();
        });
      }
    });
  });
};


/**
 * To save a new chat message using we are using 
 * [`insert`](http://www.rethinkdb.com/api/javascript/insert/). 
 *
 * An `insert` op returns an object specifying the number
 * of successfully created objects and their corresponding IDs:
 *
 * ```
 * {
 *   "inserted": 1,
 *   "errors": 0,
 *   "generated_keys": [
 *     "b3426201-9992-ab84-4a21-576719746036"
 *   ]
 * }
 * ```
 *
 * @param {Object} msg
 *    The message to be saved
 *
 * @param {Function} callback
 *    callback invoked once after the first result returned
 *
 * @returns {Boolean} `true` if the user was created, `false` otherwise 
 */
module.exports.saveMessage = function (msg, callback) {
  connectdb.onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('messages').insert(msg).run(connection, function (err, result) {
      if (err) {
        logerror("[ERROR][%s][saveMessage] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if (result.inserted === 1) {
          callback(null, true);
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

/**
 * Adding a new user to database using  [`insert`](http://www.rethinkdb.com/api/javascript/insert/).
 *
 * If the document to be saved doesn't have an `id` field, RethinkDB automatically
 * generates an unique `id`. This is returned in the result object.
 *
 * @param {Object} user
 *   The user JSON object to be saved.
 *
 * @param {Function} callback
 *    callback invoked once after the first result returned
 *
 * @returns {Boolean} `true` if the user was created, `false` otherwise
 */
module.exports.saveUser = function (user, callback) {
  connectdb.onConnect(function (err, connection) {
    r.db(dbConfig.db).table('users').insert(user).run(connection, function (err, result) {
      if (err) {
        logerror("[ERROR][%s][saveUser] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if (result.inserted === 1) {
          callback(null, true);
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};