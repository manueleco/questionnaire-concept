import {build,context} from 'esbuild';
import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
const options={entryPoints:['src/app.tsx'],bundle:true,outfile:'dist/app.js',format:'esm',target:['es2022'],minify:true,sourcemap:false,jsx:'automatic'};
if(process.argv.includes('--watch')){const ctx=await context(options);await ctx.watch();console.log('Watching React sources. Django serves dist/. Rebuild for CSS/static changes.');}else{await build(options);console.log('Built dist/');}
