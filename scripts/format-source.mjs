// Dependency-free formatting using the project's existing TypeScript compiler.
import ts from 'typescript';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {transform} from 'esbuild';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
for(const path of [...walk('src'),...walk('tests'),...walk('public'), 'playwright.config.ts']){
 if(/\.(tsx?|m?js)$/.test(path)){
  const source=ts.createSourceFile(path,readFileSync(path,'utf8'),ts.ScriptTarget.Latest,true,path.endsWith('.tsx')?ts.ScriptKind.TSX:path.endsWith('.ts')?ts.ScriptKind.TS:ts.ScriptKind.JS);
  if(source.parseDiagnostics.length)throw Error(`Cannot format ${path}`);
  writeFileSync(path,ts.createPrinter({newLine:ts.NewLineKind.LineFeed}).printFile(source));
 }else if(path.endsWith('.css'))writeFileSync(path,(await transform(readFileSync(path,'utf8'),{loader:'css',minify:false})).code);
}
