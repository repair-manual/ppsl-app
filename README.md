# PPSL-App

## Purpose
The app is intended for people that aren't familiar with MediaWiki to have a UX that allows them to add new problems to products as well as add solutions to said problems. Each solution will then have a link that may redirect you elsewhere, whether it be a Youtube video or an external Rossmann Store link. **It's not meant to be an app for people who want to look at how to repair things (That's what the Wiki is for), but rather an app for people who want to provide documentation on how to do repairs.**

* What does being "Ratelimited by Github" mean?

If you don't use the app with a Github Personal Access Token, you will have a limited amount of actions that you can do per hour. Get yourself a Token to get a higher ratelimit.

* What place does it have in the Wiki effort?

Eventually all entries inputted into **PPSL will be automatically formatted and put into the Wiki**. However that's not done and for now, you can browse all entries in raw format over at Github: <https://github.com/repair-manual/ppsl-data> or just use the PPSL app.

* Why Github?

Version control! Github is the platform that the PPSL data is hosted on, and the reason it's Github is because all data is version controlled. That means we can ponder over, revert and keep track of all changes to the data.

* Show me some!

Sure, here take a look: https://streamable.com/lmm5nt and here's the project: https://repair-manual.github.io/ppsl-app

### Features

* Product comments via [Utterances](https://utteranc.es/).

[See more planned features here.](https://github.com/orgs/repair-manual/projects/1)

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
If you are using Web Storm go into Settings `CTRL + ALT + S` and select *Editor | File Types.*

Next select `HTML` under the `Recognized File Types` panel.

Finally, next to the `File Name Patterns` panel click the Plus icon and add `*.uce` to this panel and click apply
