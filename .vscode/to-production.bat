@echo off
set HOME=.\app

set "HERE=%cd%"
set VSCODE=%HERE%\.vscode

call git checkout master .firebaserc
call git checkout master .gitignore
call git checkout master .github
call git checkout master %HOME%

call terser %HOME%\js\prerender.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\prerender.js
call terser %HOME%\js\postrender.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\postrender.js
call terser %HOME%\js\main.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\main.js
call terser %HOME%\js\item.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\item.js

call terser %HOME%\serviceworker.js -o %HOME%\serviceworker.js


call terser %HOME%\item\storage.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json -o %HOME%\item\storage.js