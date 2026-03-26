const objectIds = new WeakMap<object, number>()
let nextObjectId = 1

export function objectKey(obj: object | null): string | null {
  if (!obj)
    return null
  let id = objectIds.get(obj)
  if (!id) {
    id = nextObjectId++
    objectIds.set(obj, id)
  }
  return `obj:${id}`
}

export function fileItemKey(fileItem: object | null): string | null {
  return objectKey(fileItem)
}

export function dataViewKey(view: object | null): string | null {
  return objectKey(view)
}
