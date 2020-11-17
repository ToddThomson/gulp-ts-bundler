'use strict';

import * as gulp from "gulp"
import { TsBundler } from "./../src/TsBundler"

const sourceDir = './tests/projects/greeter/app';
const testBaselines = './tests/spec/baselines/';

TsBundler.src( sourceDir )
    .pipe( gulp.dest( testBaselines + "greeter" ) );
