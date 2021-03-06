﻿import * as ts from "typescript";
import * as ts2js from "ts2js";
import * as fs from "fs";
import File = require( "vinyl" )
import * as stream from "stream"
import * as PluginError from "plugin-error"
import * as chalk from "chalk";
//import { BundleBuilder } from "tsbundler"
import { Project } from "./Project"
import { ProjectConfig } from "./ProjectConfig"
import { ProjectOptions } from "./ProjectOptions"
import { ProjectBuildResult, BuildResult } from "./ProjectBuildResult"
import { BuildStream } from "./BuildStream"
import { StatisticsReporter } from "../../../TsToolsCommon/src/Reporting/StatisticsReporter";
import { DiagnosticsReporter } from "../../../TsToolsCommon/src/Reporting/DiagnosticsReporter";
import { Logger } from "../../../TsToolsCommon/src/Reporting/Logger";

export class ProjectBuilder
{
    //private project: Project;
    private config: ProjectConfig;
    private options: ProjectOptions;

    //private outputStream: CompileStream;

    private totalBuildTime: number = 0;
    private totalCompileTime: number = 0;
    private totalPreBuildTime: number = 0;
    private totalBundleTime: number = 0;

    constructor( project: Project )
    {
        //this.project = project;
        this.config = project.getConfig();
        this.options = project.getOptions();
    }

    public build( buildCompleted: ( result: BuildResult ) => void ): void
    {
        // Configuration errors?
        if ( this.config.errors )
        {
            if ( this.options.verbose )
            {
                DiagnosticsReporter.reportDiagnostics( this.config.errors );
            }

            return buildCompleted( new ProjectBuildResult( this.config.errors ) );
        }

        // Perform the build..
        this.buildWorker( ( buildResult ) =>
        {
            // onBuildCompleted...
            if ( this.options.outputToDisk )
            {
                if ( buildResult.succeeded() )
                {
                    buildResult.compileResult.getOutput().forEach( ( emit: ts2js.CompileOutput ) =>
                    {
                        if ( !emit.emitSkipped )
                        {
                            if ( emit.codeFile )
                            {
                                fs.writeFileSync( emit.codeFile.fileName, emit.codeFile.data );
                            }
                            if ( emit.dtsFile )
                            {
                                fs.writeFileSync( emit.dtsFile.fileName, emit.dtsFile.data );
                            }
                            if ( emit.mapFile )
                            {
                                fs.writeFileSync( emit.mapFile.fileName, emit.mapFile.data );
                            }
                        }
                    } );
                }
            }

            this.reportBuildStatus( buildResult );

            return buildCompleted( buildResult );
        } );
    }

    public src(): stream.Readable
    {
        if ( this.config.errors )
        {
            if ( this.options.verbose )
            {
                DiagnosticsReporter.reportDiagnostics( this.config.errors );
            }

            throw new PluginError( {
                plugin: "TsProject",
                message: "Invalid typescript configuration file " + this.config.fileName
            } );
        }

        var outputStream = new BuildStream();
        var vinylFile: File;

        // Perform the build..
        this.buildWorker( ( buildResult ) =>
        {
            // onBuildCompleted...

            //if ( buildResult.compileResults )
            //{
            //    buildResult.compileResults.forEach( ( bundleBuildResult ) =>
            //    {
            //        var bundleSource = bundleBuildResult.getBundleSource();
            //        vinylFile = new File( { path: bundleSource.path, contents: Buffer.from( bundleSource.text ) } )
            //        outputStream.push( vinylFile );
            //    } );
            //}

            // Emit bundle compilation results...
            if ( buildResult.succeeded() )
            {
                buildResult.compileResult.getOutput().forEach( ( emit ) =>
                {
                    if ( !emit.emitSkipped )
                    {
                        if ( emit.codeFile )
                        {
                            vinylFile = new File( { path: emit.codeFile.fileName, contents: Buffer.from( emit.codeFile.data ) } )

                            outputStream.push( vinylFile );
                        }
                        if ( emit.dtsFile )
                        {
                            vinylFile = new File( { path: emit.dtsFile.fileName, contents: Buffer.from( emit.dtsFile.data ) } )

                            outputStream.push( vinylFile );
                        }

                        if ( emit.mapFile )
                        {
                            vinylFile = new File( { path: emit.mapFile.fileName, contents: Buffer.from( emit.mapFile.data ) } )

                            outputStream.push( vinylFile );
                        }
                    }
                } );
            }

            this.reportBuildStatus( buildResult );

            outputStream.push( null );
        } );

        return outputStream;
    }

    private buildWorker( buildCompleted: ( result: BuildResult ) => void ): void
    {
        if ( this.options.verbose )
        {
            Logger.log( "Building project with: " + chalk.magenta( `${this.config.fileName}` ) );
            Logger.log( "TypeScript version: ", ts.version );
        }

        let fileNames = this.config.files;
        let compilerOptions = this.config.compilerOptions;

        // Compile the project...
        let compiler = new ts2js.Compiler( compilerOptions );

        if ( this.options.verbose )
        {
            Logger.log( "Compiling project files..." );
        }

        this.totalBuildTime = new Date().getTime();
        this.totalCompileTime = new Date().getTime();

        var compileResult = compiler.compile( fileNames );

        this.totalCompileTime = new Date().getTime() - this.totalCompileTime;

        var compileErrors = compileResult.getErrors();
        if ( compileErrors.length > 0 )
        {
            DiagnosticsReporter.reportDiagnostics( compileErrors );

            return buildCompleted( new ProjectBuildResult( compileErrors ) );
        }
 
        this.buildBundles();

        this.totalBuildTime = new Date().getTime() - this.totalBuildTime;

        if ( this.options.verbose )
        {
            this.reportStatistics();
        }

        return buildCompleted( new ProjectBuildResult(
            compileResult.getErrors(), compileResult ) );
    }

    private buildBundles()
    {
        let bundles = this.config.bundles;

        this.totalBundleTime = new Date().getTime();

        // Create a bundle builder to build bundles..
        //var bundleBuilder = new Bundler.BundleBuilder( compiler.getHost(), compiler.getProgram(), this.config.bundlerOptions );

        if ( this.options.verbose && ( bundles.length == 0 ) )
        {
            Logger.log( chalk.yellow( "No bundles found to build." ) );
        }

        for ( var i = 0, len = bundles.length; i < len; i++ )
        {
            if ( this.options.verbose )
            {
                Logger.log( "Building bundle: ", chalk.cyan( bundles[i].name ) );
            }

            //var bundleResult = bundleBuilder.build( bundles[i] );

            //bundleBuildResults.push( bundleResult );

            //if ( !bundleResult.succeeded() )
            //{
            //    DiagnosticsReporter.reportDiagnostics( bundleResult.getErrors() );
            //    allDiagnostics.concat( bundleResult.getErrors() );

            //    continue;
            //}

            //var bundleSource = bundleResult.getBundleSource();

            //var compileResult: ts2js.CompileResult;

            //if ( bundles[i].config.minify )
            //{
            //    //compileResult = tsMinifier.minifyModule( bundleSource.text, bundleSource.path, compilerOptions, { mangleIdentifiers: true, removeWhitespace: true } );
            //} else
            //{
            //    compileResult = ts2js.TsCompiler.compileModule( bundleSource.text, bundleSource.path, compilerOptions );
            //}

            //bundleCompileResults.push( compileResult );

            //if ( this.options.verbose && ( compileResult.getErrors().length > 0 ) )
            //{
            //    DiagnosticsReporter.reportDiagnostics( compileResult.getErrors() );
            //    allDiagnostics.concat( compileResult.getErrors() );
            //}
        }

        this.totalBundleTime = new Date().getTime() - this.totalBundleTime;
    }

    private reportBuildStatus( buildResult: BuildResult )
    {
        if ( this.options.verbose )
        {
            if ( buildResult.succeeded() )
            {
                Logger.log( chalk.green( "Build completed successfully." ) );
            }
            else
            {
                Logger.log( chalk.red( "Build completed with errors." ) );
            }
        }
    }

    private reportStatistics()
    {
        let statisticsReporter = new StatisticsReporter();

        statisticsReporter.reportTitle( "Total build times..." );
        statisticsReporter.reportTime( "Pre-build time", this.totalPreBuildTime );
        statisticsReporter.reportTime( "Compiling time", this.totalCompileTime );
        statisticsReporter.reportTime( "Bundling time", this.totalBundleTime );
        statisticsReporter.reportTime( "Build time", this.totalBuildTime );
    }
}