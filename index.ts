import type { Root } from 'hast'
import { visit } from 'unist-util-visit'

const lexer = (input: string): string[] => {
  const [lexed, num] = input.split('').reduce<[lexed: string[], num: string]>(
    ([lexed, num], char) => {
      switch (char) {
        case ' ': {
          if (num) {
            lexed.push(num)
          }

          return [lexed, '']
        }
        case '=':
        case '"':
        case '\'':
        case '`':
        case '[':
        case ']': {
          if (num) {
            lexed.push(num)
          }

          lexed.push(char)

          return [lexed, '']
        }
        default: {
          const newNum = num + char

          return [lexed, newNum]
        }
      }
    },
    [[], '']
  )

  if (num) {
    lexed.push(num)
  }

  return lexed
}

const parser = (input: string): Record<string, string | boolean | [start: number, end: number]> => {
  const lexed = lexer(input)

  function S () {
    return Expression()
  }

  function Key (): string {
    const lexeme = lexed.shift()

    if (lexeme === undefined) {
      throw 'invalid key expr'
    }

    switch (lexeme) {
      case '=':
      case '"':
      case '\'':
      case '`':
      case '[':
      case ']': {
        throw 'invalid key expr'
      }
    }

    return lexeme
  }

  function Sentence (endToken: string): string {
    let sentence = ''


    while (lexed[0] !== endToken) {
      sentence += lexed.shift()
    }

    return sentence
  }


  function Range (): [start: number, end: number] {

    const lexeme = lexed.shift()

    if (lexeme === undefined) {
      throw 'invalid range expr'
    }

    const matched = lexeme.match(/^(\d+)-(\d+)$/)

    if (!matched) {
      throw 'invalid range expr'
    }

    const [_, start, end] = matched

    if (isNaN(+start) || isNaN(+end)) {
      throw 'invalid range expr'
    }

    return [+start, +end]
  }

  function Value (): string | boolean | [start: number, end: number] {
    const lexeme = lexed.shift()

    if (lexeme === undefined) {
      throw 'invalid value expr'
    }
    if (lexeme === '=') {
      const nextLexeme = lexed.shift()

      if (nextLexeme === undefined) {
        throw 'invalid value expr'
      }

      if (nextLexeme === 'false') {
        return false
      } else if (nextLexeme === 'true') {
        return true
      }

      if (nextLexeme === ']') {
        throw 'invalid value expr'
      } else if (nextLexeme === '[') {
        const value = Range()

        if (lexed.shift() !== ']') {
          throw 'invalid value expr'
        }

        return value
      } else if (nextLexeme === '"' || nextLexeme === '\'' || nextLexeme === '`') {
        const sentence = Sentence(nextLexeme)

        if (lexed.shift() !== nextLexeme) {
          throw 'invalid value expr'
        }

        return sentence
      }

      return nextLexeme
    } else {
      return true
    }
  }

  function Expression (): Record<string, string | boolean | [start: number, end: number]> {
    if (!lexed.length) {
      return {}
    }

    const [key, value] = [Key(), Value()]

    return {
      [key]: value,
      ...Expression(),
    }
  }

  const result = S()

  if (lexed.length) {
    throw 'invalid expr'
  }

  return result
}

export type RehypeMetaType<T extends Record<string, string | boolean | [start: number, end: number]>, S = 'metaString'> = T & Record<S & string, string>

export type RehypeMetaStringOptions = {
  /**
   * Specify the field name which holds the raw meta string.
   * By default, it is `metaString`. 
   */
  metaString?: string,
}

export const rehypeMetaString = (options: RehypeMetaStringOptions) => {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'code' && node.data && 'meta' in node.data && node.data.meta && typeof node.data.meta === 'string') {
        const meta = node.data.meta

        const parsed = parser(meta)

        Object.assign(node.properties, parsed)

        if (options.metaString) {
          node.properties[options.metaString] = meta
        }
      }
    })
  }
}