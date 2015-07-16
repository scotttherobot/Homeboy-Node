var express = require('express'),
    fs      = require('fs'),
    request = require('request'),
    app     = express();


/**
 * Read the config in and return it all!
 */
app.get('/', function (req, res) {
   fs.readFile('./remote_config.json', 'utf8', function (err, data) {
      if (err) {
         res.status(500).json({error: "configuration file missing"});
      }
      
      var config = JSON.parse(data);
      res.json(config);
   });
});

/**
 * Return the config for a specific remote.
 */
app.get('/remote/:remote_id', function (req, res) {
   var remote = req.params.remote_id;
   fs.readFile('./remote_config.json', 'utf8', function (err, data) {
      if (err) {
         res.status(500).json({error: "configuration file missing"});
      }
      
      var config = JSON.parse(data).remotes;
      if (config.hasOwnProperty(remote)) {
         // We have a config for this remote. Great.
         res.json(config[remote]);
         console.log("Sent config for ", remote);
      } else if (config.hasOwnProperty('default')) {
         // Remote config not found. Send the default.
         res.json(config['default']);
         console.log("Sent config for default");
      } else {
         // error
         res.status(500).json({error: "configuration not found"});
         console.log("Config not found");
      }
   });
});

/**
 * Execute a particular command.
 */
app.post('/command/:command_id', function (req, res) {
   var command_id = req.params.command_id;
   // TODO: Cache our commands!
   fs.readFile('./remote_config.json', 'utf8', function (err, data) {
      if (err) {
         res.status(500).json({error: "configuration file missing"});
      }
      
      var commands = JSON.parse(data).commands;
      console.log("Got command " + command_id);


      if (commands.hasOwnProperty(command_id)) {
         console.log("Command is recognized. Making request...");
         // We have a definition for this command. Great.
         var command = commands[command_id];
         request({
            method : command.method,
            url : command.url,
            headers : {
               'Content-Type' : command.type
            },
            body : command.data
         }, function (err, response, body) {
            if (err) console.log(err);
            res.status(response.statusCode).json({status: "ok"});
            console.log("Response: ", response.statusCode);
         });
      } else {
         // error
         console.log("COMMAND NOT FOUND.");
         res.status(500).json({error: "command not found"});
      }

   });
});

/**
 * Listen.
 */
var server = app.listen(3456, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Listening on %s:%s', host, port);
});
