import * as FS from "fs";
import { Argv } from "yargs";
import { get as rpcFetch } from "./src/rpc/util";
import * as urls from "./src/rpc/urls";

import prettier from "prettier";

type EndpointDescription = {
  static: {
    get_service: {
      output: {
        json_schema: any;
      };
    };
  };
};

type WithProtocol = {
  protocol: string;
};

const ensureIdentifier = (k: string) => {
  if (Number.isInteger(parseInt(k[0]))) {
    k = "_" + k;
  }
  return k.replaceAll(".", "$").replaceAll("-", "_").replaceAll(" ", "_");
};

const fmtObjAsConst = (varName: string, obj: object) => {
  const asConst = typeof obj === "string" ? "" : "as const";
  return `const ${ensureIdentifier(varName)} = ${JSON.stringify(
    obj
  )} ${asConst};`;
};

const main = async () => {
  const { hideBin } = require("yargs/helpers");

  const argv = require("yargs/yargs")(hideBin(process.argv))
    .usage(
      "$0 <url>",
      "generate types from Tezos RPC descriptions",
      (yargs: Argv) => {
        yargs.positional("url", {
          describe: "URL for Tezos Node RPC",
          type: "string",
        });
      }
    )
    .strict()
    .parse();

  const node = argv.url;

  const blockHeader = (await rpcFetch(
    `${node}/${urls.E_BLOCK_HEADER("head")}`
  )) as unknown as WithProtocol;

  const shortProtoHash = blockHeader.protocol.substr(0, 12);

  const outDirBase = `src/rpc/types`;
  const outDirProto = `${outDirBase}/${shortProtoHash}`;

  FS.mkdirSync(outDirProto, { recursive: true });

  const typeNames = {
    [urls.E_IS_BOOTSTRAPPED]: { name: "BootstrappedStatus", protocol: false },
    [urls.E_NETWORK_CONNECTIONS]: {
      name: "NetworkConnection",
      protocol: false,
    },
    [urls.E_TEZOS_VERSION]: { name: "TezosVersion", protocol: false },
    [urls.E_CONSTANTS("head")]: { name: "Constants", protocol: true },
    [urls.E_BAKING_RIGHTS("head")]: { name: "BakingRights", protocol: true },
    [urls.E_ENDORSING_RIGHTS("head")]: {
      name: "EndorsingRights",
      protocol: true,
    },
    [urls.E_BLOCK("head")]: {
      name: "Block",
      protocol: true,
    },
    [urls.E_BLOCK_HEADER("head")]: {
      name: "BlockHeader",
      protocol: true,
    },
  };

  const defPrefix = "#/definitions/";
  const resolveDefinitions = (obj: any, seenKeys?: string[]) => {
    if (Object.prototype.toString.call(obj) === "[object Array]") {
      return obj.map((x: any) => {
        return resolveDefinitions(x, seenKeys);
      });
    }
    if (Object.prototype.toString.call(obj) === "[object Object]") {
      if (obj.$ref && obj.$ref.startsWith(defPrefix)) {
        const origKey = obj.$ref.substr(defPrefix.length);
        const refKey = ensureIdentifier(origKey);
        if (seenKeys) seenKeys.push(origKey);
        return `@${refKey}@`;
      }
      const result: any = {};
      for (const [k, v] of Object.entries(obj)) {
        if (Object.prototype.toString.call(v) === "[object Object]") {
          const ref = (v as any).$ref;
          if (ref && ref.startsWith(defPrefix)) {
            const origKey = ref.substr(defPrefix.length);
            const refKey = ensureIdentifier(origKey);
            if (seenKeys) seenKeys.push(origKey);
            result[k] = `@${refKey}@`;
          } else {
            result[k] = resolveDefinitions(v, seenKeys);
            if (seenKeys) seenKeys.push(k);
          }
        } else {
          result[k] = resolveDefinitions(v, seenKeys);
          if (seenKeys) seenKeys.push(k);
        }
      }
      return result;
    }
    return obj;
  };

  for (const [url, { name, protocol }] of Object.entries(typeNames)) {
    console.log("=======", name);
    try {
      const desc = (await rpcFetch(
        `${node}/describe/${url}`
      )) as unknown as EndpointDescription;
      const schema = desc["static"].get_service.output.json_schema;

      const serializedParts: string[] = [];
      const serializedDefinitions: Record<string, string> = {};

      const seenKeys: string[] = [];
      console.log("Resolving definitions");
      const definitionsFixedUnistring = {
        ...schema.definitions,
        unistring: { type: "string" },
      };
      const definitions = resolveDefinitions(
        definitionsFixedUnistring,
        seenKeys
      );
      const processed: any = {};
      for (const origKey of seenKeys.concat(Object.keys(definitions))) {
        if (processed[origKey]) continue;
        const v = definitions[origKey];
        if (v !== undefined) {
          const refKey = ensureIdentifier(origKey);
          const code = fmtObjAsConst(refKey, v as any);
          const importFrom = `./${refKey}`;
          const importLine = `import ${refKey} from "${importFrom}";`;
          if (!serializedParts.includes(importLine)) {
            serializedParts.push(importLine);
          }
          serializedDefinitions[refKey] = `${code}\nexport default ${refKey};`;
          processed[origKey] = true;
        }
      }
      delete schema["definitions"];

      const outDir = protocol ? outDirProto : outDirBase;

      for (const [k, v] of Object.entries(serializedDefinitions)) {
        const importNames: string[] = [];
        for (const m of v.matchAll(/@(.+?)@/g)) {
          const name = m[1];
          if (!importNames.includes(name)) {
            importNames.push(name);
          }
        }
        const serialized =
          importNames
            .map((name) => `import ${name} from "./${name}";`)
            .join("\n") +
          "\n\n" +
          v.replaceAll('"@', " ").replaceAll('@"', " ");
        try {
          const pretty = prettier.format(serialized, { parser: "typescript" });
          FS.writeFileSync(`${outDir}/${k}.ts`, pretty);
        } catch (err) {
          console.error(serialized);
          throw err;
        }
      }

      serializedParts.push(`${fmtObjAsConst(
        "schema",
        resolveDefinitions(schema)
      )}

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
${schema.type === "array" ? "export type Item = T[number];" : ""};
export default T;
`);
      const serialized = serializedParts
        .join("\n\n")
        .replaceAll('"@', " ")
        .replaceAll('@"', " ");

      const pretty = prettier.format(serialized, { parser: "typescript" });
      FS.writeFileSync(`${outDir}/${name}.ts`, pretty);
    } catch (x) {
      console.error(x);
    }
  }
};

main();
