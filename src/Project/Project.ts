import * as ts from "typescript"
import * as _ from "lodash"
import { BundleConfigParser } from "tsbundler"
import { ProjectConfig } from "./ProjectConfig"
import { ProjectOptions} from "./ProjectOptions"
import { TsCore } from "../../../TsToolsCommon/src/typescript/core"
import { Utils } from "../../../TsToolsCommon/src/utils/utilities"

export class Project
{
    private configFilePath: string;
    private options: ProjectOptions;

    constructor( configFilePath: string, options?: ProjectOptions )
    {
        this.configFilePath = configFilePath;
        this.options = options ? Utils.extend( options, this.getDefaultOptions() ): this.getDefaultOptions();
    }

    public getOptions(): ProjectOptions
    {
        return this.options;
    }

    public getConfig(): ProjectConfig
    {
        let configFile = TsCore.readConfigFile( this.configFilePath );

        if ( configFile.errors.length > 0 )
        {
            return { fileName: this.configFilePath, errors: configFile.errors };
        }

        let tsProjectConfig: ts.ParsedCommandLine = ts.parseJsonConfigFileContent(
            configFile.config, ts.sys, configFile.basePath, undefined, configFile.fileName );

        if ( tsProjectConfig.errors.length > 0 )
        {
            return { fileName: this.configFilePath, errors: tsProjectConfig.errors };
        }

        // Parse "bundle" project configuration objects...
        var bundleParser = new BundleConfigParser();
        var bundlesParseResult = bundleParser.parseConfigFile( this.configFilePath );

        if ( bundlesParseResult.errors.length > 0 )
        {
            return { fileName: this.configFilePath, errors: bundlesParseResult.errors };
        }

        // The returned bundles "Files" list may contain file glob patterns.
        // TJT: Future support?
        //bundlesParseResult.bundles.forEach( bundle =>
        //{
        //    bundle.fileNames = this.expandFileNames( bundle.fileNames, this.configFileDir );
        //} );

        return {
            fileName: configFile.fileName,
            basePath: configFile.basePath,
            compilerOptions: tsProjectConfig.options,
            files: tsProjectConfig.fileNames,
            projectReferences: tsProjectConfig.projectReferences,
            typeAcquisition: tsProjectConfig.typeAcquisition,
            bundles: bundlesParseResult.bundles
        }
    }

    //private getBundleConfig(): ProjectConfig
    //{
    //    // Parse the command line args to override project file compiler options
    //    let settingsCompilerOptions = this.getSettingsCompilerOptions( this.settings, this.configFileDir );

    //    // Check for any errors due to command line parsing
    //    if ( settingsCompilerOptions.errors.length > 0 )
    //    {
    //        return { success: false, errors: settingsCompilerOptions.errors };
    //    }

    //    let compilerOptions = Utils.extend( settingsCompilerOptions.options, configParseResult.options );

    //}

    //private readFile( fileName: string ): string
    //{
    //    return ts.sys.readFile( fileName );
    //}

    private getSettingsCompilerOptions( jsonSettings: any, configDirPath: string ): ts.ParsedCommandLine
    {
        // Parse the json settings from the TsProject src() API
        let parsedResult = ts.parseJsonConfigFileContent( jsonSettings, ts.sys, configDirPath );

        // Check for compiler options that are not relevent/supported.

        // Not supported: --project, --init
        // Ignored: --help, --version

        if ( parsedResult.options.project )
        {
            let diagnostic = TsCore.createDiagnostic( { code: 5099, category: ts.DiagnosticCategory.Error, key: "The_compiler_option_0_is_not_supported_in_this_context_5099", message: "The compiler option '{0}' is not supported in this context." }, "--project" );
            parsedResult.errors.push( diagnostic );
        }

        // FIXME: Perhaps no longer needed?

        //if ( parsedResult.options.init ) {
        //    let diagnostic = TsCore.createDiagnostic( { code: 5099, category: ts.DiagnosticCategory.Error, key: "The_compiler_option_0_is_not_supported_in_this_context_5099", message: "The compiler option '{0}' is not supported in this context." }, "--init" );
        //    parsedResult.errors.push( diagnostic );
        //}

        return parsedResult;
    }

    private getDefaultOptions(): ProjectOptions
    {
        return {
            logLevel: 0,
            verbose: true, // TJT: Just for testing
            outputToDisk: false,
            bundleOnly: true
        }
    }
}