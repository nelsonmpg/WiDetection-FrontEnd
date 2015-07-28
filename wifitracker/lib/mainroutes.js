var fs = require('fs');
var path = require('path');

exports.routesIndex = function (req, res) {

  fs.readFile(path.join(__dirname, "./../www/index.html"), 'utf8', function (err, data) {
    if (err)
      throw err;
    res.writeHead(200);
    res.end(data);
  });
};