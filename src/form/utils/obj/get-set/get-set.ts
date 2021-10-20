type AnyObj = { [k: string]: any } | any[]
// Keep get-set as a generic object setting util, not tied to immer or Form
type Path = (string | number)[]

export function get(obj: AnyObj, path: Path) {
  let target = obj
  for (let i = 0; i < path.length; i++) {
    if (typeof target !== "object") return undefined
    target = target[path[i]]
  }
  return target
}

export function del(obj: AnyObj, path: Path, clean: boolean = false) {
  let target = obj

  // loop up until the second last path prop
  for (let i = 0; i < path.length - 1; i++) {
    /* 
    If the path already doesn't exist we will bail.
    If clean param is true then we will recurse up and delete empty objects until there are no empty objects left
    */
    if (typeof target[path[i]] !== "object") {
      if (clean) del(obj, path.slice(0, i - 2), clean)
      return
    }

    target = target[path[i]]
  }

  const isArray = Array.isArray(target)

  delete target[path[path.length - 1]]

  if (clean && !Object.keys(target).length) {
    del(obj, path.slice(0, -1))
  }
}

export function set(
  obj: AnyObj,
  path: Path,
  value: any,
  clean: boolean = false
) {
  /* 
  If we are in clean mode then there is no point adding empty objects
  for paths that will immediately get removed
  */
  if (value === undefined && clean) {
    del(obj, path, true)
  } else {
    let target = obj

    for (let i = 0; i < path.length - 1; i++) {
      const prop = path[i]
      if (typeof target[prop] !== "object") {
        if (!isNaN(Number(path[i + 1]))) {
          target[prop] = []
        } else {
          target[prop] = {}
        }
      }
      target = target[prop]
    }

    /* If we are not in clean mode we will need the empty objects added above before we do our delete */
    if (value === undefined) {
      del(obj, path, false)
    } else {
      target[path[path.length - 1]] = value
    }
  }
}

export function push(obj: AnyObj, path: Path, value: any) {
  if (!get(obj, path)) {
    set(obj, path, [])
  }

  const array = get(obj, path) as any[]
  array.push(value)
}

export function splice(
  obj: AnyObj,
  path: Path,
  index: number,
  deleteCount: number,
  ...values: any[]
) {
  let arr = get(obj, path) as any[]
  if (!Array.isArray(arr)) {
    set(obj, path, [])
    arr = get(obj, path) as any[]
  }
  arr.splice(index, deleteCount, ...values)
}

export function remove(obj: AnyObj, path: Path, value: any) {
  let arr = get(obj, path) as any[]

  if (!Array.isArray(arr)) return
  let index = arr.indexOf(value)

  if (index === -1) return

  arr.splice(index, 1)
}
