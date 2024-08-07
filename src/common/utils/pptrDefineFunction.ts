export function pptrDefineFunction(fn: ((...args: any[]) => any) | string) {
  if (typeof fn === 'string') return fn
  const fnString = fn.toString()
  if (fnString.startsWith('(')) return `const ${fn.name} = ${fnString}`
  if (fnString.startsWith('function ')) return fnString
  return `function ${fnString}`
}
