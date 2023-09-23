# rehype-meta-string

<div align="center">

[![Known Vulnerabilities][known-vulnerabilities-image]][known-vulnerabilities-url]
[![Maintainability][maintainability-image]][maintainability-url]
![publish workflow][publish-workflow-image]
[![license][license-image]][license-url]
[![GitHub issues][github-issues-image]][github-issues-url]
![NPM bundle size(minified + gzip)][bundle-size-image]

[known-vulnerabilities-image]: https://snyk.io/test/github/zheeeng/rehype-meta-string/badge.svg
[known-vulnerabilities-url]: https://snyk.io/test/github/zheeeng/rehype-meta-string

[maintainability-image]: https://api.codeclimate.com/v1/badges/d3eaf22221bf57742429/maintainability
[maintainability-url]: https://codeclimate.com/github/zheeeng/rehype-meta-string/maintainability

[publish-workflow-image]: https://github.com/zheeeng/rehype-meta-string/actions/workflows/publish.yml/badge.svg

[license-image]: https://img.shields.io/github/license/mashape/apistatus.svg
[license-url]: https://github.com/zheeeng/rehype-meta-string/blob/master/LICENSE

[github-issues-image]: https://img.shields.io/github/issues/zheeeng/rehype-meta-string
[github-issues-url]: https://github.com/zheeeng/rehype-meta-string/issues

[bundle-size-image]: https://img.shields.io/bundlephobia/minzip/rehype-meta-string.svg

[![NPM](https://nodei.co/npm/rehype-meta-string.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/rehype-meta-string/)

</div>

> A rehype plugin for parsing the meta string of markdown code fence.

This plugin parse the meta string into key-value paris and assign them to `code` tag ast nodes.

The parsing contains rules below:

* **`true`**: empty or literal value `true` is treated as `true`
* **`false`**: literal value `false` is treated as `false`
* **word**: literal string without spaces is treated as word.
* **sentence**: double quoted, singled quoted, back-ticked string are treated as string.
* **range**: square brackets wrapped string is treated as range numbers. It requires format like `{digits}-{digits}`.
* **mixed**: mix all the markers above.

There is the illustration table:

| meta string     | parsed |
| --------------- | ------------------- |
| foo             | { foo: true }       |
| foo=true        | { foo: true }      |
|  |  |
| foo=false       | { foo: false }      |
|  |  |
| foo=bar         | { foo: "bar" }      |
|  |  |
| foo="false"     | { foo: "false" }    |
| foo='false'     | { foo: "false" }    |
| foo=\`false\`   | { foo: "false" }    |
| foo="true"      | { foo: "true" }     |
| foo='true'      | { foo: "true" }     |
| foo=\`true\`    | { foo: "true" }     |
| foo="bar baz"   | { foo: "bar baz" }  |
| foo='bar baz'   | { foo: "bar baz" }  |
| foo=\`bar baz\` | { foo: "bar baz" }  |
|  |  |
| foo=[42-71]     | { foo: [42, 71] }   |
|  |  |
| foo foo1=true foo2=false foo3=bar foo4="true" foo5='false' foo6=\`hello world\` foo7=[42-71] | { foo: true, foo1: true, foo2: false, foo3: "bar", foo4: "true", foo5: "false", foo6="hello world", foo7: [42, 71] }

## 🧩  Installation

```bash
yarn add rehype-meta-string (or npm/pnpm)
```

## 💫 Options

* **metaString**?: string

> Specify the field name which holds the raw meta string. By default, it is `metaString`.
