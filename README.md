### Usage

Replace tracking ID in `./src/index.js`

```
npm install
webpack --watch
npm start
```

Within `/src/index.js`, using `import './analytics.js'` will cause tracking to work, while using `import 'autotrack'` will not.
