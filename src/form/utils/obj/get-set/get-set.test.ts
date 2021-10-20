import { get, set, remove, push, del } from "./get-set"

const initialState = () => ({
  children: [
    {
      name: "Bryn",
    },
  ],
})

describe("get-set utils", () => {
  describe("set()", () => {
    it("sets a property with mutation", () => {
      const state = initialState()

      set(state, ["children", "0", "name"], "Fred")

      expect(state.children[0].name).toBe("Fred")
    })

    it("creates nested objects as needed", () => {
      const state = initialState() as any

      set(state, ["meta", "parent", "dad", "name"], "Lorem")

      expect(state.meta).toEqual({
        parent: {
          dad: {
            name: "Lorem",
          },
        },
      })
    })

    it("revursively deletes when deleting empty objects in clean mode", () => {
      const state = initialState()

      set(state, ["children", "0"], undefined, true)

      expect(state).toEqual({})
    })

    it("creates nested arrays as needed", () => {
      const state = initialState() as any

      set(state, ["children", "0", "family", 0, 1, 0], true)

      expect(state.children[0]).toEqual({
        name: "Bryn",
        family: [[, [true]]],
      })
    })
  })

  describe("del()", () => {
    test("deletes a property", () => {
      const state = initialState()

      del(state, ["children", "0", "name"])

      expect(state).toEqual({
        children: [{}],
      })
    })

    it("recursively deletes empty objects", () => {
      const state = initialState()

      del(state, ["children", "0", "name"], true)

      expect(state).toEqual({})
    })
  })

  describe("get()", () => {
    it("gets a property", () => {
      const state = initialState()

      expect(get(state, ["children", "0", "name"])).toBe("Bryn")
    })
  })

  describe("push", () => {
    it("Pushes a value onto an array", () => {
      const state = initialState()
      push(state, ["children"], { name: "George" })

      expect(state.children[1].name).toBe("George")
    })

    it("Creates nested array's as needed", () => {
      const state = initialState() as any

      push(state, ["family"], { name: "Lorem" })

      expect(state.family).toMatchObject([{ name: "Lorem" }])
    })
  })
})
