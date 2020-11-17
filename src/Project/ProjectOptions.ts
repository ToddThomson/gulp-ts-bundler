import { CompileTransformers } from "ts2js";

export interface ProjectOptions
{
    /** 
     *  Sets the log level. Defaults to 0
     */
    logLevel?: number;

    /**
     * Sets verbose output. Defaults to false.
     */
    verbose?: boolean;

    /**
     * Sets emitting to disk. Defaults to false.
     */
    outputToDisk?: boolean;

    // TJT: What does this do?
    forceBuild?: boolean;

    /**
     * Generates bundles only. Defaults to true.
     */
    bundleOnly?: boolean;

    transformers?: CompileTransformers;
}