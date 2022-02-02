const fitness = {
  title: "Block fitness",
  description:
    "The fitness, or score, of a block, that allow the Tezos to decide which chain is the best. A fitness value is a list of byte sequences. They are compared as follows: shortest lists are smaller; lists of the same length are compared according to the lexicographical order.",
  type: "array",
  items: { type: "string", pattern: "^([a-zA-Z0-9][a-zA-Z0-9])*$" },
} as const;
export default fitness;
