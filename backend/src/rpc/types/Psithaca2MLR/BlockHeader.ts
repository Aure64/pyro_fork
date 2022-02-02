import unistring from "./unistring";

import Chain_id from "./Chain_id";

import block_hash from "./block_hash";

import timestamp$protocol from "./timestamp$protocol";

import Operation_list_list_hash from "./Operation_list_list_hash";

import fitness from "./fitness";

import Context_hash from "./Context_hash";

import value_hash from "./value_hash";

import cycle_nonce from "./cycle_nonce";

import Signature from "./Signature";

import block_header from "./block_header";

const schema = block_header;

import { FromSchema } from "json-schema-to-ts";
type T = FromSchema<typeof schema>;
export default T;
