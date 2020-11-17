# gulp-ts-bundler
gulp-ts-bundler is a Typescript module bundler for gulp plugin.

gulp-ts-bundler produces a compiled output stream of vinyl files for further processing in the gulp build pipeline.

## Top Features

* Bundling of ES6 external Typescript modules
* Bundle minification with identifier shortening and whitespace removal
* Cache optimized incremental project builds
 
## What's New

Supports Typescript 4.0.x.

## Why gulp-ts-bundler?

TsProject is the only Typescript transpiler that provides minified, single file typescript bundles and javascript bundles for packaging of Typescript, javascript and Typescript definition files.
TsProject bundles file dependencies of external Typescript modules at compilation time rather than relying on build tools (AMD Optimizer, r.js for example ) further down in the build pipeline.

## gulp-ts-bundler Wiki

Additional details can be found on the TsProject [wiki](https://github.com/ToddThomson/tsproject/wiki).

## How to install

```
npm install tsproject
```

## API

    bundle.src( projectConfigPath: string, settings: any )

Where:

**projectConfigPath** is a relative directory path to the default Typescript project file named "tsconfig.json".
Or,
**projectConfigPath** is a relative path to a named Typescript project file.   

## Usage - Gulp Build Pipeline

gulp-ts-bundler on github contains a [TodoMVC sample](https://github.com/ToddThomson/tsproject/tree/master/TsProjectTodoMVC) to help you get started.
The sample is built using Angular, Typescript ES6 modules and Require.

Here is a simple gulpfile.js:

```
var tsproject = require( 'tsproject' );
var gulp = require( 'gulp' );
gulp.task( 'build', function() {

    // path to directory of tsconfig.json provided
    bundler.src( './src/project' )
        .pipe(gulp.dest('./build'));

    // path to named configuration file provided and optional settings specified 
    return bundler.src( './src/project_a/myconfig.json',
		{ 
			logLevel: 1,
			compilerOptions: {
				listFiles: true
			} 
		})
        .pipe( gulp.dest( './mybuild' ) );

});
```

## Building gulp-ts-bundler

gulp-ts-bundler depends on [NPM](https://docs.npmjs.com/) as a package manager and 
[Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) as a build tool. 
If you haven't already, you'll need to install both these tools in order to 
build gulp-ts-bundler.

Once Gulp is installed, you can build it with the following commands:

```
npm install
gulp build
```  



