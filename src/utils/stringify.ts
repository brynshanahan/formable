export function stringify(val: { [k: string]: any }, indent: number = 2) {
  const cache: any[] = [];
  // Stringify and remove circular references (and internal React keys)
  const result = JSON.stringify(
    val,
    (key, value) => {
      switch (key) {
        case "_owner":
        case "_store":
          return;
        default: {
          if (typeof value === "object" && value !== null) {
            // Duplicate reference found, discard key
            if (cache.includes(value)) return;

            // Store value in our collection
            cache.push(value);
          }
          return value;
        }
      }
    },
    indent
  );
  return result;
}
