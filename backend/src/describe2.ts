import { compile } from "json-schema-to-typescript";

import * as FS from "fs";
import { Argv } from "yargs";
import { get as rpcFetch } from "./rpc/util";
import * as urls from "./rpc/urls";

const defPrefix = "#/definitions/";

const stripDefPrefix = (s: string) => {
  return s.substr(defPrefix.length);
};

const ensureIdentifier = (k: string) => {
  if (Number.isInteger(parseInt(k[0]))) {
    k = "_" + k;
  }
  return k.replaceAll(".", "$").replaceAll("-", "_").replaceAll(" ", "_");
};

const ensureIdentifierInRef = (value: string) => {
  if (value.startsWith(defPrefix)) {
    return defPrefix + ensureIdentifier(stripDefPrefix(value));
  }
  return value;
};

function preprocessSchema(inputSchema: any): any {
  switch (inputSchema.type) {
    case "object":
      const outputSchema: any = {};
      Object.entries(inputSchema).forEach(([name, value]) => {
        outputSchema[ensureIdentifier(name)] = value;
      });
      return {
        ...outputSchema,
        properties: preprocessProperties(inputSchema.properties),
        definitions: preprocessProperties(inputSchema.definitions),
      };
    case "array":
      return {
        ...inputSchema,
        definitions: preprocessProperties(inputSchema.definitions),
        items: preprocessSchema(inputSchema.items),
      };
    default:
      if (Array.isArray(inputSchema)) {
        return inputSchema.map(preprocessSchema);
      }
      if (inputSchema.$ref) {
        // Workaround for: https://github.com/bcherny/json-schema-to-typescript/issues/193
        const out: any = {
          $ref: ensureIdentifierInRef(inputSchema.$ref),
        };
        if (inputSchema.definitions)
          out.definitions = preprocessProperties(inputSchema.definitions);
        return out;
      }
      if (inputSchema.allOf) {
        return {
          allOf: inputSchema.allOf.map(preprocessSchema),
          properties: preprocessProperties(inputSchema.properties),
          definitions: preprocessProperties(inputSchema.definitions),
        };
      }
      if (inputSchema.oneOf) {
        return {
          oneOf: inputSchema.oneOf.map(preprocessSchema),
          properties: preprocessProperties(inputSchema.properties),
          definitions: preprocessProperties(inputSchema.definitions),
        };
      }
      if (inputSchema.anyOf) {
        return {
          anyOf: inputSchema.anyOf.map(preprocessSchema),
          properties: preprocessProperties(inputSchema.properties),
          definitions: preprocessProperties(inputSchema.definitions),
        };
      }
      return inputSchema;
  }
}

function preprocessProperties(inputProperties: any) {
  if (inputProperties) {
    const outputProperties: any = {};
    Object.entries(inputProperties).forEach(([name, value]) => {
      // console.log("~~~~~~", name, value);
      outputProperties[ensureIdentifier(name)] = preprocessSchema(value);
    });
    // console.log("xxxxx", outputProperties);
    return outputProperties;
  }
  return undefined;
}

// const schemaFile = '...';
// const outFileName = '..';
// const schema = preprocessSchema(require(schemaFile));
// const ts = await compile(schema, schemaFile, {
//   style: {
//     singleQuote: true,
//   },
// });
// fs.writeFileSync(outFileName, ts, 'utf8');

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

  const outDirSchemasBase = `tezos-rpc-schemas`;
  const outDirSchemasProto = `${outDirSchemasBase}/${shortProtoHash}`;

  const outDirBase = `src/rpc/types`;
  const outDirProto = `${outDirBase}/${shortProtoHash}`;

  FS.mkdirSync(outDirSchemasProto, { recursive: true });
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
      protocol: false,
    },
    [urls.E_DELEGATES_PKH("head", "tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9")]: {
      name: "Delegate",
      protocol: false,
    },
  };

  for (const [url, { name, protocol }] of Object.entries(typeNames)) {
    console.log("=======", name);
    const outDir = protocol ? outDirProto : outDirBase;
    const outDirSchemas = protocol ? outDirSchemasProto : outDirSchemasBase;
    const schemaFileName = `${outDirSchemas}/${name}.json`;
    try {
      if (!FS.existsSync(schemaFileName)) {
        console.log(`Downloading schema to ${schemaFileName}`);
        const desc = (await rpcFetch(
          `${node}/describe/${url}`
        )) as unknown as EndpointDescription;
        let schema = desc["static"].get_service.output.json_schema;
        schema.definitions = {
          ...schema.definitions,
          unistring: { type: "string" },
        };

        if (schema.$ref) {
          const defName = stripDefPrefix(schema.$ref);
          const definition = schema.definitions[defName];
          delete schema.definitions[defName];
          delete schema.$ref;
          schema = { ...definition, ...schema };
        }
        const processedSchema = preprocessSchema(schema);
        FS.writeFileSync(
          `${outDirSchemas}/${name}.json`,
          JSON.stringify(processedSchema, null, 2),
          "utf8"
        );
      } else {
        console.log(`Reading schema from ${schemaFileName}`);
      }
      const schema = JSON.parse(FS.readFileSync(schemaFileName, "utf8"));
      const ts = await compile(schema, name);
      const tsFileName = `${outDir}/${name}.d.ts`;
      FS.writeFileSync(tsFileName, ts);
      console.log(`Wrote ${tsFileName}`);
    } catch (x) {
      console.error(x);
    }
  }
};

main();
