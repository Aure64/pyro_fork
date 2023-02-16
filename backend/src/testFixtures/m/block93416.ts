import { BlockM } from "../../rpc/types";

const block93416: BlockM = {
  protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
  chain_id: "NetXnHfVqm9iesp",
  hash: "BMAfwcBrw6Mk47gcZhDx1Gw7BfYrwLU4VK8Ek6KJKfYVK46AXAc",
  header: {
    level: 93416,
    proto: 2,
    predecessor: "BMAFZkZwocmusWG8Rh8KfotRsoW6FjasGRFUmFQVMuKHwXdqK48",
    timestamp: "2022-02-15T21:08:25Z",
    validation_pass: 4,
    operations_hash: "LLoaSx8taNwmhJnWR25KAiZ1gmNrvoQ2uv2ntZQjV7157uYtQAb9w",
    fitness: ["02", "00016ce8", "", "fffffffe", "00000000"],
    context: "CoUuBVgLsiKFkf8ngQn9o9MEhN8cfbMozVS46t4qn9mrzg1oHxo8",
    payload_hash: "vh2o67YmyhaH3QNVET73gymj6UZ4TJa4Wx11npqukwKa45FZczJy",
    payload_round: 0,
    proof_of_work_nonce: "df2ea592e52f0800",
    liquidity_baking_toggle_vote: "on",
    signature:
      "sigRpvrAem3gWy2XtJnAaHy72LsDquChP6Ngrp72FcmT5gtyjrEvj8QhJzkMo6jw9DzaFXFJeFiv3XvrKyhrMAaYEK8p9vc3",
  },
  metadata: {
    protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
    next_protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
    test_chain_status: {
      status: "not_running",
    },
    max_operations_ttl: 120,
    max_operation_data_length: 32768,
    max_block_header_length: 289,
    max_operation_list_length: [
      {
        max_size: 4194304,
        max_op: 2048,
      },
      {
        max_size: 32768,
      },
      {
        max_size: 135168,
        max_op: 132,
      },
      {
        max_size: 524288,
      },
    ],
    proposer: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
    baker: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
    proposer_consensus_key: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
    baker_consensus_key: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
    level_info: {
      level: 93416,
      level_position: 93415,
      cycle: 22,
      cycle_position: 3303,
      expected_commitment: false,
    },
    voting_period_info: {
      voting_period: {
        index: 4,
        kind: "proposal",
        start_position: 81920,
      },
      position: 11495,
      remaining: 8984,
    },
    nonce_hash: null,
    consumed_milligas: "0",
    liquidity_baking_toggle_ema: 115615,
    deactivated: [],
    balance_updates: [
      {
        kind: "minted",
        category: "baking rewards",
        change: "-5000000",
        origin: "block",
      },
      {
        kind: "contract",
        contract: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
        change: "5000000",
        origin: "block",
      },
      {
        kind: "minted",
        category: "baking bonuses",
        change: "-3373082",
        origin: "block",
      },
      {
        kind: "contract",
        contract: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
        change: "3373082",
        origin: "block",
      },
    ],
    implicit_operations_results: [
      {
        kind: "transaction",
        storage: [
          {
            int: "1",
          },
          {
            int: "233537500100",
          },
          {
            int: "100",
          },
          {
            bytes: "01e927f00ef734dfc85919635e9afc9166c83ef9fc00",
          },
          {
            bytes: "0115eb0104481a6d7921160bc982c5e0a561cd8a3a00",
          },
        ],
        balance_updates: [
          {
            kind: "minted",
            category: "subsidy",
            change: "-2500000",
            origin: "subsidy",
          },
          {
            kind: "contract",
            contract: "KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5",
            change: "2500000",
            origin: "subsidy",
          },
        ],
        consumed_milligas: "224023",
        storage_size: "4632",
      },
    ],
  },
  operations: [
    [
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ook1uAev8aYfxPV5rU3dp4SfcskDkbRwZwkrnNBKWKyu6x2hKCj",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 1,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
              endorsement_power: 1188,
              consensus_key: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
            },
          },
        ],
        signature:
          "sigVc9GC7cDaq5ACHm5JUZTfR4PverbjneZ6xCoXnRqfWFth675sQ53S1JtYp1FS4rJELxHk1sSZYabvStFqKzfuPq3NFRwu",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo7qfcbAzRFPGFekef4BND27EUf4mbf3yfLA97jf9sumPa6F6tR",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 2,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1MeT8NACB8Q4uV9dPQ3YxXBmYgapbxQxQ5",
              endorsement_power: 780,
              consensus_key: "tz1MeT8NACB8Q4uV9dPQ3YxXBmYgapbxQxQ5",
            },
          },
        ],
        signature:
          "sigPBGyr1NA2zSsf94QxXvVmwYpwTRya9wyhXPDfJSoskMedD5DpSUraMHdTJKQi5gkUS6cxfKWyMEMuw536hTP963ZqTkt6",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo3C8V1fH6poGVfVdvEqoS5CSu1oygf4SAHJt1YEVF7Z1muqiLQ",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 3,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1Zt8QQ9aBznYNk5LUBjtME9DuExomw9YRs",
              endorsement_power: 150,
              consensus_key: "tz1Zt8QQ9aBznYNk5LUBjtME9DuExomw9YRs",
            },
          },
        ],
        signature:
          "sigbTfnGfixeqz1mFZ9fSSpu74eVuq3r6SjkFpPfqrs4R7gk96bn4NGbs6WBF9JUztu4hf4aPwNdeiZFGTKMSYKMCSvbEwuV",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oniHZWobZbQv2SYv3JtbsWbaRVBryjFUXbwEp2GEadRGS8rVgDe",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 4,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1cg5EqC3WdZgRSvGJeW328S4KQNrT4jvyv",
              endorsement_power: 234,
              consensus_key: "tz1cg5EqC3WdZgRSvGJeW328S4KQNrT4jvyv",
            },
          },
        ],
        signature:
          "sigf8ZGQwxjoGnyfEmDN7P8pByzxCovtLJ3xrEJtQ3cDqmZGG9pK3dQBVmXUvR95A6QLUk51PPFvJJRRWExm7Go9AYAH8sb9",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo4BCrzQxwCSeECCBE2c4G9xfAjnEja5dbviCb5QFJnks97a7VB",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 5,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP",
              endorsement_power: 156,
              consensus_key: "tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP",
            },
          },
        ],
        signature:
          "sigiqxiHBM8zoGyjzTYVDvXcCATidUrBZSR3ToGNgMKb2yDx3RCPw43Da24yavdbv79nJRGLPSLvpJx8uew3AJ7zHGfCsVgy",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "op5AfUPx2YyA1Pi21r5CR4i188V66Tm3YhqSHaMMzkoaxXT4fRs",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 6,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
              endorsement_power: 147,
              consensus_key: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
            },
          },
        ],
        signature:
          "sigVr49KnS4AszDhfAafcmjsz8EAULPonekkJHALfTda2fgs4JRi2JDksAqbRKvwK5VTweWmcpKXYC92vH2zgbmPenVqDxJh",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oonJqS1Uoxt3hLgBy1LEBB6EPQUbj9BEWhc523cjPJmY62Hk9si",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 7,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
              endorsement_power: 205,
              consensus_key: "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
            },
          },
        ],
        signature:
          "sigNozZXSBmsvtc13WEsEpTLKoTFRwCCtMtdULjksWoa2dBkzENLqd2UqbYPyaKcaRHNdK8qkJviM5QkDNtBdet662RkvKub",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo6v9ozsKJbLcfT19BQug2TahwFbVTguYxJHaitci5JUdgAnBkT",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 9,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1NiaviJwtMbpEcNqSP6neeoBYj8Brb3QPv",
              endorsement_power: 278,
              consensus_key: "tz1NiaviJwtMbpEcNqSP6neeoBYj8Brb3QPv",
            },
          },
        ],
        signature:
          "sigXFyg2Ahm7gyuVvtHUcCXJfoc4qvLw3Ev6eyFAqE4fMRmjRH3dk484JZTAvtCtWytaepWRAxXqExtWvgqcGJgKiqmmR4kt",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opCvzbnnvhzjTj3MXb8gmVbtBaLG8rUbdBUgY1BbpfEBKvyZeFo",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 13,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1e42w8ZaGAbM3gucbBy8iRypdbnqUj7oWY",
              endorsement_power: 135,
              consensus_key: "tz1e42w8ZaGAbM3gucbBy8iRypdbnqUj7oWY",
            },
          },
        ],
        signature:
          "signwhjsbLQChknKQQDFNPJRArNuuiZqjqUyXS8ZKTo75d3NxfmYru55DX9h2z6VVwQkLQoukAhYMupN2tkypgx3M3AZ15Uj",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooBcwZcjLmxKXKnXLL4oeGKYzPn17ta2krPzhkWjNyv4stNhFx3",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 16,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1V9CRVyKP3roXsnjcFJP3p9DSXX63KL7iP",
              endorsement_power: 142,
              consensus_key: "tz1V9CRVyKP3roXsnjcFJP3p9DSXX63KL7iP",
            },
          },
        ],
        signature:
          "sigdpZv1bBATYDCqW6tP885Z9U4fDaXHAo8Pe9XHBvS4L1SSJUeQtW2rEg39U4w3vRLpmFN9Phnba566zsVjtcZRGTQz1Pak",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onf3fisfeuQ5fLya6umA9hmyK9x1grjxFmc8q1eo5BsVFCoHAEL",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 22,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1iZ9LkpAhN8X1L6RpBtfy3wxpEWzFrXz8j",
              endorsement_power: 196,
              consensus_key: "tz1iZ9LkpAhN8X1L6RpBtfy3wxpEWzFrXz8j",
            },
          },
        ],
        signature:
          "sigmsXEZyHa39XpdatGn7f7L9LTqAmmT2P8vzBBtFnx4ahjdZ1JTmuESWMRpXZe6BgWHJPYyYDe8GRUUV5Wqn1U5YAnFacfb",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opTZsPaY8nEaQSufutkwDwYFWxwDRg1JPnMbDyz9RUGvNahW7CG",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 23,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
              endorsement_power: 142,
              consensus_key: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
            },
          },
        ],
        signature:
          "sigPqvqahWwzxJmJJMuuXDavsv7R9XFTxygojUKGDkpPUFUGi4AL7GiV2zDpEEAZGuCW17m7V2KqpHUFh9e4xA4B97HBbLgS",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "op1MDPmSxmr4KFNaqWJ1dRGg71YaXvtVKiUkCYQQGdzvkcVECUD",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 24,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1NFs6yP2sXd5vAAbR43bbDRpV2nahDZope",
              endorsement_power: 120,
              consensus_key: "tz1NFs6yP2sXd5vAAbR43bbDRpV2nahDZope",
            },
          },
        ],
        signature:
          "sigiwsNjb52X4yJL7qmvxiQNRyKSZLpv3pzgZkZFfKv5C6ZZXaZq5tZq2Yc3wAiJuCgmapUqj3xGWLvuMLmAiFjAzdeduxmn",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooZVvABTK8hgNQY5StnDoUyztVWerAdEbp1f7aG83EcsWovPsHr",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 26,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1Q7YBzLJkw87c2FdwaWuGKyacSDc4QghzQ",
              endorsement_power: 130,
              consensus_key: "tz1Q7YBzLJkw87c2FdwaWuGKyacSDc4QghzQ",
            },
          },
        ],
        signature:
          "sigZHUxRQYaE2pL1YsCTQaw1AfJvPCcnSfq3wD7WYtQDi2YkVWWQvyLKk2huAPzgu2P9tvqRRBU4t5bG3XFRxyGinbETDn8u",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "op9cvAfB98rprNrARSBDgyuZP2dn9S9egde3xRJhT3H3viUAtGn",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 29,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1LQ32syCNyGj6FdAuJfko42Wep87iYZk8k",
              endorsement_power: 155,
              consensus_key: "tz1LQ32syCNyGj6FdAuJfko42Wep87iYZk8k",
            },
          },
        ],
        signature:
          "sigrC4fcYFH7WuBUHWSoVkZY84UC789Nfhi3L4nNcQvNAbda8KndFaoGEK4TY31JsYC5wx1A65mEmSyGhk1Z2LuAuq9iNYgm",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oobYnQNJTQ3Gu2VsGXMdKuQdCWhtgBb38ogKWUx2trWvkUrQtQP",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 31,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1funU3PjPsuXvmtXMgnAckY1s4pNT6V7WJ",
              endorsement_power: 161,
              consensus_key: "tz1funU3PjPsuXvmtXMgnAckY1s4pNT6V7WJ",
            },
          },
        ],
        signature:
          "sigQGtw7EoqLBQ8TdLvDNz2C7oYDQJz5mc3mVDXgDn8r4SGpKuHHGFcmyBD5rNaJ888DvmvpgZM3sPdgb9FUJo7BbhR3omVq",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opHThN782SXpdoSQJY9tPe7sDC6SBo3WMC7vdiiYL945PbayaCs",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 34,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1ituzNz9MGaMSL9dVDN7jE5SArCEWNmZbS",
              endorsement_power: 143,
              consensus_key: "tz1ituzNz9MGaMSL9dVDN7jE5SArCEWNmZbS",
            },
          },
        ],
        signature:
          "sighf62VkzZsFyBupXa2KpZfrc1CaF81VrFhgZZUoXa4KQy8UVePkYruT83P4NcwPkagNci4q4d8NYHKfP1jf3J6NtffyKyW",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onxv7BtcQ8M8sZykgBPR3uC9vDpXTKMTJhpWmWiNmVM33DPVb8p",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 38,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1MvCE9dczhoij2bd4sLL2AfVuMtWfFAoCN",
              endorsement_power: 155,
              consensus_key: "tz1MvCE9dczhoij2bd4sLL2AfVuMtWfFAoCN",
            },
          },
        ],
        signature:
          "sigffGG6SYMDUMVKDJi7h4fzVvrm5neLAioeawe7sMbEjCsbgExgMPNDZFuxUDc2qdxi1HQCd1hv9YL3gzA1R1gNzSsPQCux",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo6ZzMXMu4soyhMmbMveUBPWRnCwJEd2kwwVTtuSUCCgPHox4V2",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 40,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1XMiZwHpHZ8a1AfwRWKfzLskJgZNyV8PHs",
              endorsement_power: 144,
              consensus_key: "tz1XMiZwHpHZ8a1AfwRWKfzLskJgZNyV8PHs",
            },
          },
        ],
        signature:
          "sigauKnMHXCM9zyideZQLCJYSCARikp8qh9mPrE5cCCQmyQ1cAWbueDsdutAjDApDU6t1QxDCKvv4zWV5zmc5m7PRv2jxLB2",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oobJDHH2PgLx5o6SJueUY8ZwUxwjkT2DM9b7wTARsnnkeWLwacb",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 44,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1RJ74UepJA9tigjoEeUEFajowzVB3QQaVx",
              endorsement_power: 150,
              consensus_key: "tz1RJ74UepJA9tigjoEeUEFajowzVB3QQaVx",
            },
          },
        ],
        signature:
          "sigu527Px8V4HNVxVABWDSecN9X8XCGeyGyWBZamJyDfpMpm5tUEdtijigDbrNdTWdx3eWNWYi14qFPAYsrvcacvH8EniwX8",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooN4MdNrwSTbH8i35PJrKTCeV1yp8Q8AThfCP8Dca2Ch6ykwA8A",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 48,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1dqPQn5HXNJ7yjcqBx2w6sozjPXTV1kpfh",
              endorsement_power: 156,
              consensus_key: "tz1dqPQn5HXNJ7yjcqBx2w6sozjPXTV1kpfh",
            },
          },
        ],
        signature:
          "sigaVM86NFHjA4Nvk8eKFKh4PjBQKw3teYz2AzJiCQrak11VNu8PCsB6teGuYUygfKqTFUxnD7QyhWpCT8ptWbg79YPj4xkq",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooge1r3PHerGmu9ooGHVmsuELD2Ww7J4MPXTiBUF2t2CJYwTEiM",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 50,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1KkJtLB9pMdLKNpVRNZw9zmysrxKmYcRGU",
              endorsement_power: 139,
              consensus_key: "tz1KkJtLB9pMdLKNpVRNZw9zmysrxKmYcRGU",
            },
          },
        ],
        signature:
          "sigZgkGdz5ge6DhdCfhd8zKCJFqFsvE1YMt5D6eyyahczFhJtVN4iR4SmGbftr9FVWN9wdQEa1SkaYUXXTWLVauoYQxyAyg1",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooEjLGwqdfmzokFifsq7KswFtJTDFDAJDJ3MJQzgkap2EM2DYc5",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 52,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1QXAAasy8TciwfvDC4a7MWo1tm3K37uN9Y",
              endorsement_power: 171,
              consensus_key: "tz1QXAAasy8TciwfvDC4a7MWo1tm3K37uN9Y",
            },
          },
        ],
        signature:
          "sigSXXW4oQrm95NtX28ofEvaSU3zA8FraR3gYEf18iErnuTaoYYdN3jZv6QJdiggrQ2dzj8ecpdo53qLcxPC2yzj1EfViUgy",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooFqdvAbfyTqbQ2f77p1QNuDGPXsZSUD5LCRCeMwVi1gvhTH5cA",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 61,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1Wn7JnLVf7PpTbaLQNzmNaF9z9UudWHGBR",
              endorsement_power: 145,
              consensus_key: "tz1Wn7JnLVf7PpTbaLQNzmNaF9z9UudWHGBR",
            },
          },
        ],
        signature:
          "sighBcHx5Wn2999LaSbiDgCuveNGNhH7ssSDnS7KkAHjRmWKiCTZGuEtQ79pRRX9hULobyujwFRZ6oKzmEAJYgNXABK8CsxD",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooxJQySof8wxgPVgmLZAASNSfDkdDgiNBNwXxxmJqsU8oEf84LZ",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 70,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1foXHgRzdYdaLgX6XhpZGxbBv42LZ6ubvE",
              endorsement_power: 226,
              consensus_key: "tz1foXHgRzdYdaLgX6XhpZGxbBv42LZ6ubvE",
            },
          },
        ],
        signature:
          "sigri8vzbLiPrA6QeX7GM6agywTvKH5DHe96UdZaGdjU2vjR3fzyBkGHoDuxP6ADkmkuFYBFJF3D6aNDUTh7M9ccnaHkgeqh",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opJ2FkKhixUf5YFJTQ84aitv5ZpxDEyH2YfpuKbzwDnYcd4PGXb",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 88,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1hm7NuCGNSKZQLQSawjUnehJcX8yCBcCAq",
              endorsement_power: 157,
              consensus_key: "tz1hm7NuCGNSKZQLQSawjUnehJcX8yCBcCAq",
            },
          },
        ],
        signature:
          "sigdq8s3Be9S78iszVGaz5kFm1EFU7F2XJkVHqqCradjQ4ZXMSzrX88RPBJBbgQpWsB4U4GBYJjmG45AGh1r69ypbzAbyRgP",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo52iCsnRNJdkEvdAEE79qwV8t7eidETgY19NJnrsuZtBnwwW3h",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 92,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1cjyja1TU6fiyiFav3mFAdnDsCReJ12hPD",
              endorsement_power: 148,
              consensus_key: "tz1cjyja1TU6fiyiFav3mFAdnDsCReJ12hPD",
            },
          },
        ],
        signature:
          "sigwLdGfa5d872AzMMkE3PSK4nupLEyBiL5HBYtHMsX7E5QXwdUDmT1XkhqwBvLid3y8UNtc8bics6gcdsRx9BtiekXtuQdk",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onkaaXzyDJXtMfnDdYrXS6zpsr7bvMv2sm5K1jExiepCPTcKLoN",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 116,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1PirbogVqfmBT9XCuYJ1KnDx4bnMSYfGru",
              endorsement_power: 138,
              consensus_key: "tz1PirbogVqfmBT9XCuYJ1KnDx4bnMSYfGru",
            },
          },
        ],
        signature:
          "sigv2YmmvMsVHaihDSijo2Pd8mNWKKKamV8H5uz61HyGbXvzqxz7eS9G6iSvRfgVB8tSCJR2rgaeqh1tfmz5fCeQ2SEZvUYu",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opWACc8qytoMiKGmKE18MSf2qPCwo93vQVXNEE3trMKVztB3uzR",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 118,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1NGS7FEGGfEFp5XRVkHBqVqSQ8VuumF9j3",
              endorsement_power: 45,
              consensus_key: "tz1NGS7FEGGfEFp5XRVkHBqVqSQ8VuumF9j3",
            },
          },
        ],
        signature:
          "signNDMUvihLeiYiYFw4bLNaS3hrAN218C4FrNcXeHMbKagoUieHJCcciBDd6WnSJhBi611JtVY5Wk59wzJ77Dr4JR152UYr",
      },
      {
        protocol: "PtMumbaiiFFEGbew1rRjzSPyzRbA51Tm3RVZL5suHPxSZYDhCEc",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooK4Q4fqc6X5XimT8TdbwMUToYbwwsw3Z527pKWYjmfTQir5gRY",
        branch: "BLBdaJ1FeiTHn88WyCDHfT6jvDQ2m4MzgkKBQ4ejQMyWRfssxWj",
        contents: [
          {
            kind: "endorsement",
            slot: 1257,
            level: 93415,
            round: 1,
            block_payload_hash:
              "vh317SCdF11DbekKFEN8AuRN7usDqDbbzGi6LoQrkhXY1BLPfA6t",
            metadata: {
              balance_updates: [],
              delegate: "tz1SFbdg2jjkixHNU1Jm9f8JA4pYnMXsgATC",
              endorsement_power: 5,
              consensus_key: "tz1SFbdg2jjkixHNU1Jm9f8JA4pYnMXsgATC",
            },
          },
        ],
        signature:
          "signc4tFPx3Np9YiUE4rahUwmSGStiojMenGUvpMN8JgU2y4vzM43FWWSECQzg2FveLVhsA8xi9m6b6momYwv2B6quKQKLD4",
      },
    ],
    [],
    [],
    [],
  ],
};

export default block93416;
