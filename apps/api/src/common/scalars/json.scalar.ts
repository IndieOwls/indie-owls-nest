import { Scalar, CustomScalar } from '@nestjs/graphql'
import { Kind, ValueNode } from 'graphql'

@Scalar('JSON', () => Object)
export class JSONScalar implements CustomScalar<any, any> {
  description = 'Arbitrary JSON value'

  parseValue(value: any): any {
    return value
  }

  serialize(value: any): any {
    return value
  }

  parseLiteral(ast: ValueNode): any {
    switch (ast.kind) {
      case Kind.STRING: return ast.value
      case Kind.BOOLEAN: return ast.value
      case Kind.INT: return parseInt(ast.value, 10)
      case Kind.FLOAT: return parseFloat(ast.value)
      case Kind.OBJECT: {
        const obj: Record<string, any> = {}
        for (const field of (ast as any).fields) {
          obj[field.name.value] = this.parseLiteral(field.value)
        }
        return obj
      }
      case Kind.LIST: return (ast as any).values.map((v: any) => this.parseLiteral(v))
      case Kind.NULL: return null
      default: return null
    }
  }
}
