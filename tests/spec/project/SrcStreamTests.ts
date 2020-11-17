import { expect } from "chai"
import { TsBundler } from "../../../src/TsBundler"

describe( "Src()", () =>
{
    function buildWithSrc( name: string, projectConfigPath: string )
    {
        describe( name, () =>
        {
            var buildStream = TsBundler.src( projectConfigPath );

            it( "build is stream", () =>
            {
                buildStream.once( 'data', ( file ) =>
                {
                    expect( file.isStream() ).to.be.true;
                } );
            } );
        } );
    }

    buildWithSrc( "Builds simple project stream", "./tests/projects/simple/tsconfig.json" );
    buildWithSrc( "Builds greeter project stream", "./tests/projects/greeter/app/tsconfig.json" );
} );