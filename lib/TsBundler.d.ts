/// <reference types="node" />
import { CompileTransformers } from "ts2js";
import * as stream from "stream";
interface ProjectOptions {
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
    forceBuild?: boolean;
    /**
     * Generates bundles only. Defaults to true.
     */
    bundleOnly?: boolean;
    transformers?: CompileTransformers;
}
export { ProjectOptions };
export declare namespace TsBundler {
    const version = "1.0.0-dev.1";
    function src(configFilePath: string, options?: ProjectOptions): stream.Readable;
}
