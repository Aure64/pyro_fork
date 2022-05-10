/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Signature$PublicKeyHash = string;
export type EndorsingRights = {
  level: number;
  delegates: {
    delegate: Signature$PublicKeyHash;
    first_slot: number;
    endorsing_power: number;
  }[];
  estimated_time?: Signature$PublicKeyHash;
}[];