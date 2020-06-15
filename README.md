# grunt-demo

A simple automated construction tool based on grunt.

## Usage

```sh
yarn global add cuvee-app
or
npm install cuvee-app -g
```

```sh
// local development
yarn cuvee-app develop
// build
yarn cuvee-app build
// clean
yarn cuvee-app clean
```

Instead, you can use in your npm script.

```js
{
  ...
  "scripts": {
    "dev": "cuvee-app develop",
    "clean": "cuvee-app clean",
    "build": "cuvee-app build"
  }
}
```
