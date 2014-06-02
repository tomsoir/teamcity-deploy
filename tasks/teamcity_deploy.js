/*
 * grunt-teamcity-deploy
 * https://github.com/tomsoir/teamcity-deploy
 *
 * Copyright (c) 2014 Artem Tkachenko
 * Licensed under the MIT license.
 *
 * Man
 * -----------------------------------
 * We have 2 part of auto-deploy task:
 * 
 * Part 1 (deploy on team-city)
 *      command:
 *          $ grunt deploy:development:[env]  
 *          where [env] is: dev, stb, nxt, cli, *
 *      example command:
 *          $ grunt deploy:development:nxt
 * 
 *      targets:
 *         — remove old pack dir and zip file inside
 *         — make new pack dir
 *         — compress project to new zip pack
 *         — copy zip pack to auto-deploy server path (like so: /u03/deploy/dev/hoothoot/)
 *         
 *         — change host of nodejs-server from 'localhost' to 'hs-ws-tkachenko.local' (by uname -n)
 *         — start server
 *
 * Part 2 (deploy on auto-build test server)
 *     command:
 *          $ grunt deploy:development
 * 
 *      targets:
 *          — change host of nodejs-server from 'localhost' to 'hs-ws-tkachenko.local' (by uname -n)
 *          — start server
 * 
 * Grunt configuration:
 * -----------------------------------
 * grunt.initConfig
 *     deploy:                                                          // deploy task
 *          development:                                                // deploy:development configeration (it is just a task, and could be more then one) 
 *              options:        
 *                  compress:                                           // compressing pack option
 *                      dir: "packer"                                   // creating dir for copy zip pack
 *                      archive: "packer.zip"                           // compressing pack name
 *                      includes: '.'                                   // path witch files/dirs include to zip pack
 *                      excludes: '.git/**\\*  node_modules/**\\*'      // path witch files/dirs NOT include to zip pack
 *
 *                  copyTo: # full path will be: /u03/deploy/[env]/hoothoot/        // where to copy for auto-deploy
 *                      server: "/u03/deploy/"                                      // part of path to copy (part1: server)
 *                      env: "*" # dev, stb, nxt, cli, *                            // part of path to copy (part2: environment. It gets from run task, like so: grunt deploy:development:nxt )  
 *                      dir: "/hoothoot/"                                           // part of path to copy (part3: dir or project)  
 *
 *                  startServerTasks: ['connect:server']                // run server tasks 
 */


'use strict';

module.exports = function(grunt) {

    var taskName = 'deploy';
    var path = require('path');
    var fs = require('fs');

    grunt.registerMultiTask(taskName, 'Custom grunt plugin for teamCity and autodeploy source', function(teamCitiEnv) {
        var self = this;
        if(teamCitiEnv){                                                           // deploy to teamcity
            forEachConfigs(function(config){
                grunt.log.ok("Deplot on Team City");
                deplotTeamCity(config.options, teamCitiEnv, self);
            });
        }else{                                                                     // deploy to test-stand
            forEachConfigs(function(config){
                grunt.log.ok("Deplot on Test server");
                runServerTask(config.options.startServerTasks, self);
            });
        }

    });

    var forEachConfigs = function(callback){
        var configName;
        for(configName in grunt.config.get(taskName))
            callback(grunt.config.get(taskName)[configName]);
    }
    var runServerTask = function(startServerTasks, context){
        var done = context.async();
        var exec = require("child_process").exec;
        var spawn = require("child_process").spawn;
        var uname = spawn("uname", ["-n"]);
        uname.stdout.on("data", function(data){
            var configVars = grunt.config.get("vars");
            configVars.serverHostname = String(data).replace(/^\s+|\s+$/g, "");         // triming string
            grunt.config.set("vars", configVars);                                       // changing localhost host
            grunt.log.ok("config set to: " + grunt.config.get("vars").serverHostname);
            done();

            grunt.task.run(startServerTasks);                                           // run server task
        });
    }
    var deplotTeamCity = function(options, teamCitiEnv, context){
        var compressConfig = options.compress,
            copyConfig =  options.copyTo;

        var dir = compressConfig.dir,
            archive = compressConfig.archive,
            pathToProject = compressConfig.includes,
            excludesFiles = compressConfig.excludes, 
            copyEnv = ((copyConfig.env != '*')? copyConfig.env : teamCitiEnv),
            copyPath = copyConfig.server+copyEnv+copyConfig.dir;

        if(typeof(compressConfig) == 'undefined')
            return grunt.log.error("Deploy! No compressConfig in Grunt-config.file");
        var done = context.async();
        var exec = require("child_process").exec;

        var bashRm = "rm -rf "+dir,                                                     // clear old dir
            bashMk = "mkdir "+dir,                                                      // create new dir
            bashZip= "zip -r "+dir+"/"+archive+" "+pathToProject+" -x "+excludesFiles,  // zip project
            bashCp = "cp "+dir+"/*.* "+copyPath                                         // copy to /u03/deploy/[env]/hoothoot/ for deploying on test-server by env

        exec(bashRm+" && "+bashMk+" && "+bashZip+" && "+bashCp, function(e){
            if(e){ grunt.log.error(e) }
            else {
                grunt.log.ok("Compress '"+archive+"' to "+copyPath);
                done();

                runServerTask(options.startServerTasks, context);
            }
        });
    }

};

