import * as stream from "stream"
import { Project } from "./Project/Project"
import { ProjectBuilder } from "./Project/ProjectBuilder"
import { ProjectOptions } from "./Project/ProjectOptions"

export { ProjectOptions }

export namespace GulpTsBundler
{
    export const version = "1.0.0-dev.1";

    export function src( configFilePath: string, options?: ProjectOptions ): stream.Readable
    {
        if ( configFilePath === undefined && typeof configFilePath !== 'string' )
        {
            throw new Error( "Provide a valid directory or file path to the Typescript project configuration json file." );
        }

        let projectBuilder = new ProjectBuilder( new Project( configFilePath, options ) );

        return projectBuilder.src();
    }

}

// Nodejs module exports
module.exports = GulpTsBundler;
