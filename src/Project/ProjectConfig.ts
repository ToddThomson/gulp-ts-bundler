import * as ts from "typescript"
import { Bundle } from "TsBundler"

export interface ProjectConfig
{
    fileName: string;
    basePath?: string;
    compilerOptions?: ts.CompilerOptions;
    typeAcquisition?: ts.TypeAcquisition;
    files?: string[];
    projectReferences?: ReadonlyArray<ts.ProjectReference>;
    bundles?: Bundle[];
    errors?: ReadonlyArray<ts.Diagnostic>;
    // TJT: Needed?
    // success: boolean;
}
