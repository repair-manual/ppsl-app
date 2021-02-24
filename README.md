# PPSL-App

### Features

* Product comments via [Utterances](https://utteranc.es/).

### Project setup
```sh
npm install
```

### Compiles for debugging and minifies for production (public & src folder)
```sh
npm run build
```

### Test source code
```sh
npm run debug
```

### Test production
```sh
npm run serve
```

### See `.uce` files as HTML

If you are using VS Code, you can Ctrl+Shift+P, type settings JSON, choose Open Settings (JSON), and add the following in order to highlight .uce files as HTML:

```js
{
  "other-settings": "...",

  "files.associations": {
    "*.uce": "html"
  }
}
```
