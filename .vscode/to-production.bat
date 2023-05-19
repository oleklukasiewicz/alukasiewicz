@echo off
set HOME=.\app

set "HERE=%cd%"
set VSCODE=%HERE%\.vscode

terser %HOME%\js\prerender.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\prerender.js
terser %HOME%\js\postrender.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\postrender.js
terser %HOME%\js\main.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\main.js
terser %HOME%\js\item.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json  -o %HOME%\js\item.js

terser %HOME%\serviceworker.js -o %HOME%\serviceworker.js

terser %HOME%\item\storage.js --config-file .\.vscode\terser-config.json --name-cache .\.vscode\terser-map.json -o %HOME%\item\storage.js