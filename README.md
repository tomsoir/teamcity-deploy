# grunt-teamcity-deploy

> Custom grunt plugin for teamCity and autodeploy source

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-teamcity-deploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-teamcity-deploy');
```

## Custom "teamcity-deploy" task

### Overview
There are 2 part of auto-deploy task:

Part 1 (deploy on team-city)
     command:
         ```js
         $ grunt deploy:development:[env]  
         ```
         where [env] is: dev, stb, nxt, cli, *
     example command:
         $ grunt deploy:development:nxt

     targets:
        — remove old pack dir and zip file inside
        — make new pack dir
        — compress project to new zip pack
        — copy zip pack to auto-deploy server path (like so: /u03/deploy/dev/hoothoot/)
        
        — change host of nodejs-server from 'localhost' to 'hs-ws-tkachenko.local' (by uname -n)
        — start server

Part 2 (deploy on auto-build test server)
    command:
        ```js
        $ grunt deploy:development
        ```
     targets:
         — change host of nodejs-server from 'localhost' to 'hs-ws-tkachenko.local' (by uname -n)
         — start server


###  Grunt configuration:

```js
grunt.initConfig
    deploy:                                                          // deploy task
         development:                                                // deploy:development configeration (it is just a task, and could be more then one) 
             options:
                 compress:
                     dir: "packer"
                     archive: "packer.zip"
                     includes: '.'
                     excludes: '.git/**\\*  node_modules/**\\*'
                 copyTo: # full path will be: /u03/deploy/[env]/hoothoot/
                     server: "/u03/deploy/"
                     env: "*" 
                     dir: "/hoothoot/"

                 startServerTasks: ['connect:server']                // run server tasks 
```

### Options

#### compress
compressing pack option

##### dir
compressing pack option

##### archive
creating dir for copy zip pack

##### includes
path witch files/dirs include to zip pack

##### excludes
path witch files/dirs NOT include to zip pack

#### copyTo
where to copy for auto-deploy
full path will be: /u03/deploy/[env]/hoothoot/ 
where [env] may be: dev, stb, nxt, cli,

##### server
part of path to copy (part1: server)

##### env
part of path to copy (part2: environment. It gets from run task, like so: grunt deploy:development:nxt )  

##### dir
part of path to copy (part3: dir or project)  

#### startServerTasks
run server tasks 

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
2014-06-02  v0.1.0   base task scheme created
