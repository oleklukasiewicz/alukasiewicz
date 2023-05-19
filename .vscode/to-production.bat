terser ./app/js/prerender.js --config-file ./.vscode/terser-config.json --name-cache ./.vscode/terser-map.json  -o ./app/js/prerender.js
terser ./app/js/postrender.js --config-file ./.vscode/terser-config.json --name-cache ./.vscode/terser-map.json  -o ./app/js/postrender.js
terser ./app/js/main.js --config-file ./.vscode/terser-config.json --name-cache ./.vscode/terser-map.json  -o ./app/js/main.js
terser ./app/js/item.js --config-file ./.vscode/terser-config.json --name-cache ./.vscode/terser-map.json  -o ./app/js/item.js

terser ./app/serviceworker.js -o ./app/serviceworker.js

terser ./app/item/storage.js --config-file ./.vscode/terser-config.json --name-cache ./.vscode/terser-map.json -o ./app/item/storage.js