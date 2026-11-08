import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

test('every literal UI message has both translations and matching placeholders',()=>{
  const source=ts.createSourceFile('locales.ts',fs.readFileSync('src/locales.ts','utf8'),99,true);
  const catalog=new Map();
  function collect(node){if(ts.isPropertyAssignment(node)&&ts.isStringLiteral(node.name)&&ts.isArrayLiteralExpression(node.initializer))catalog.set(node.name.text,node.initializer.elements.map(item=>item.text));ts.forEachChild(node,collect);}collect(source);
  const placeholders=text=>[...(text.matchAll(/\{\w+\}/g))].map(match=>match[0]).sort();
  for(const [message,translations] of catalog){assert.equal(translations.length,2,message);for(const text of translations){assert.ok(text?.trim(),message);assert.deepEqual(placeholders(text),placeholders(message),message);}}
  for(const file of ['src/app.tsx','src/quick-guide.tsx']){
    const ast=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),99,true,ts.ScriptKind.TSX);
    function visit(node){if(ts.isCallExpression(node)&&node.expression.getText(ast)==='t'&&ts.isStringLiteral(node.arguments[0])){const key=node.arguments[0].text;assert.ok(catalog.has(key)||['A','B','C','A / B / C'].includes(key),`${file}: ${key}`);}ts.forEachChild(node,visit);}visit(ast);
  }
});
