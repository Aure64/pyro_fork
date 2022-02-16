import { BlockI } from "../../rpc/types";

const block: BlockI = {
  protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
  chain_id: "NetXnHfVqm9iesp",
  hash: "BL2sEsEwZHChckAqCNMBvsxegTHjYDoycmsrgYrJ41jcSK1QQ6y",
  header: {
    level: 93516,
    proto: 2,
    predecessor: "BLvq3LHEp4g9vhqGho3mQ7QbdvdmnNgj451ytPwGdWVeBMTpv7X",
    timestamp: "2022-02-15T21:38:35Z",
    validation_pass: 4,
    operations_hash: "LLoZZ67sgWwoKrxeQt3HuH4T9KKgwKchDD287vmhb8m2WT3nE9RnF",
    fitness: ["02", "00016d4c", "", "ffffffff", "00000001"],
    context: "CoWFAw8Uy5vhtQroUsdBc1BfYYMNSizhrpjpecJuL2XaMwp6hobs",
    payload_hash: "vh2EsvybfiSqpvr9h4L1sgc5AtJV95HJzXBa6x23JXhdjatFXv4q",
    payload_round: 1,
    proof_of_work_nonce: "df2ea59212260100",
    liquidity_baking_escape_vote: false,
    signature:
      "sigqiTpbkcSd9YBWMdYiy6JeixDN6tWF3R6qbVXVhcyhovde3dHrCedUKBoLh4i6xVRF3woaKrREbv16VNpvg8JX2NMxJqJy",
  },
  metadata: {
    protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
    next_protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
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
    proposer: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
    baker: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
    level_info: {
      level: 93516,
      level_position: 93515,
      cycle: 22,
      cycle_position: 3403,
      expected_commitment: false,
    },
    voting_period_info: {
      voting_period: {
        index: 4,
        kind: "proposal",
        start_position: 81920,
      },
      position: 11595,
      remaining: 8884,
    },
    nonce_hash: null,
    consumed_gas: "0",
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
        contract: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
        change: "5000000",
        origin: "block",
      },
      {
        kind: "minted",
        category: "baking bonuses",
        change: "-2723753",
        origin: "block",
      },
      {
        kind: "contract",
        contract: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
        change: "2723753",
        origin: "block",
      },
    ],
    liquidity_baking_escape_ema: 116783,
    implicit_operations_results: [
      {
        kind: "transaction",
        storage: [
          {
            int: "1",
          },
          {
            int: "233787500100",
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
        consumed_gas: "225",
        consumed_milligas: "224023",
        storage_size: "4632",
      },
    ],
  },
  operations: [
    [
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oni9ASHTxNy5nCJfR6nLF2BPvxF4BQqNNqSpbYiR8Uguc7bMfN8",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 0,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
              endorsement_power: 1219,
            },
          },
        ],
        signature:
          "sigRV8dKoFGygF3TwNFPmBCPqTECcm7tRhVunsqdCESga8JfuCPJtknE33UT6SEcAU8JV5Qr25afPESWjg1bzonQGoioxPfK",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooL7GCMDX6tLafgNDHDsybnvMShDhauye9uZ6AoM8H4PDqUm3ix",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 1,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1funU3PjPsuXvmtXMgnAckY1s4pNT6V7WJ",
              endorsement_power: 132,
            },
          },
        ],
        signature:
          "sigXki26nni15Fu59uEdmBsYJm7w26XRumrdJSeXyxT9y6mTb8V4cvTdyj3NZeCmcURJSeAr8wrPaznxHNUnL79MXptiM39E",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooDxTow6PYEewPapB7QBHzUiX38fpDozGvz2zYdhwVxSzzCZWgf",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 3,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1Q7YBzLJkw87c2FdwaWuGKyacSDc4QghzQ",
              endorsement_power: 140,
            },
          },
        ],
        signature:
          "sigmVjUToztzzAbvuBe6eAfW4PNBnkCdtodiUtJ7ChLh2yzfU194r1nF23Kx2srECUXnvBLKFkjLKA2MUXMPU2z7RNw61ny1",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opSaGzjWVGhtuNnhgoWw2iLXy18D9WEnMNWKqztLbW3fVY3gsfd",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 5,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1dqPQn5HXNJ7yjcqBx2w6sozjPXTV1kpfh",
              endorsement_power: 141,
            },
          },
        ],
        signature:
          "signJZ88pHRCYfYCGaduhCkzFd8FNAeth49ZJGhRkDuNSetqEiud72m9YdC1ZM1CNv3hjiut55jjvJ1RcnLnDRWzA1hugUSb",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onydxtYSCYx18HNv2woGPPohCWEKpKBLyFbbMbT7DAzkvGAdSVs",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 7,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1ituzNz9MGaMSL9dVDN7jE5SArCEWNmZbS",
              endorsement_power: 169,
            },
          },
        ],
        signature:
          "sigrMWiPkj5Hi4WuUzSx4PXyxnVWroXRWTGp867vQYzsz1REKEy8Y1B1fmoXXwZQfT6V29fvWVQizFgtLGJF2NhPBDwMz9qt",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo81hJk5f8czDwvzWcWSehizouFEP4hUAX8Y2qcTxwWKwzuUFSb",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 8,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1QXAAasy8TciwfvDC4a7MWo1tm3K37uN9Y",
              endorsement_power: 132,
            },
          },
        ],
        signature:
          "sigtZT9nL1sBuLu64o1YuDgxx59NfJ3gjBGxK41ExZGvn8ko7UrNcVpQnzvjq6ij2HwagasmQT34cox2ySLRkF2eVad6BHnZ",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ontVnPgQydXKyyawwn93xb4ER8RndqbudYhm46BKJm8j6ztEjzP",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 9,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1foXHgRzdYdaLgX6XhpZGxbBv42LZ6ubvE",
              endorsement_power: 184,
            },
          },
        ],
        signature:
          "sigp631VJopCYjcfdFaQVuxZq94s5yDrh6ddRjzTawuz9ktWzcCusJ5hddpLpPicEVd8N5ZCt4j5gHw4CZfreSWSZxbFbqjd",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooYp3VTZErkmM57g64aTL8kZmEMopmrtgec4bPkFvby6qZxg1BU",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 10,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1V9CRVyKP3roXsnjcFJP3p9DSXX63KL7iP",
              endorsement_power: 144,
            },
          },
        ],
        signature:
          "sigUL6Ccjw7B78gqd2wGomCDKnXXzC549Az93LwmAMsAf8rYyvrzYvwta4CJaKhFJezSzGYKsCmQbmPG3N65o7HiSf2LrKAM",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooSFpZWSQpxmfJwS7hvdF6tgQxx5XrbRMWC9vRh5UPvAJAdwAdu",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 11,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1NiaviJwtMbpEcNqSP6neeoBYj8Brb3QPv",
              endorsement_power: 227,
            },
          },
        ],
        signature:
          "sigWARLwidFfRqYigkjhqEx7sDZ2Jp8VHBTnYQ8WtWHP9Yi7h96ZWKEUtR622LPfaJuzKvVEyJ8tj7nQxEP9d5KqpMcd8itD",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oonTL6uLyp8RutAxrcXCzrXizqUVbr9J3PqUGp8LuFgTR2HUKGW",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 16,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1LQ32syCNyGj6FdAuJfko42Wep87iYZk8k",
              endorsement_power: 172,
            },
          },
        ],
        signature:
          "sigf8rHjHoxT8QoQjCS1BjiEGnu6kpeCpkGUojpvx4a9RgAF9vh9gPnuX5srduEVznTw3oQUgDK2B6iSPYJhVmBdEyffgbxd",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooPf7hK81ghqT3eFzwV1L8qeTsbWxVGC5kqdqZoBpr8MQ4SeKXp",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 17,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1e42w8ZaGAbM3gucbBy8iRypdbnqUj7oWY",
              endorsement_power: 152,
            },
          },
        ],
        signature:
          "sigduTBUp7Xrary5jfCPqQ1JK5rpaBXrQSE5ounMdG54C6nK1GtuuiQdHGmEa1VYmtfkczArLqViRMq7ocfaM4pkAfya2Vo8",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo5tu1GdLvFVNgDnwThRg9eRQSrePMgdvvXqgN5NEn1RPfiQgcs",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 18,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
              endorsement_power: 201,
            },
          },
        ],
        signature:
          "sigZSK2Fh6soidDJ9oZAjUCzV7BjmHoUdFnfBv7DQUgjKZbXcvsqKaPRGSbT9c6zQRe2LwwoZUtaJp8x2nL9f93cmRdEbRsY",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooKzjFySGdYaauKPuiZLjnYQaunjX7qyJcH4Y1UBZ5PEABHFu6i",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 19,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1Wn7JnLVf7PpTbaLQNzmNaF9z9UudWHGBR",
              endorsement_power: 156,
            },
          },
        ],
        signature:
          "sigSy94oNchHcnN7UHjwdBiBZgwBjud1QRW1JBv8why3mxTN6Ad5UaZCziRcXjJkRe9aEvSV6JH1iABSHqboxcLTmYoKP5jF",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oomg1dMprmor9GacgePiXUUzbjcuUzyhdRXXtv47a4BNMR7Ls45",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 20,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1iZ9LkpAhN8X1L6RpBtfy3wxpEWzFrXz8j",
              endorsement_power: 189,
            },
          },
        ],
        signature:
          "sigitPTZmZNGBMJQWsBg91SG2EP7SxqoJTeU1sra29EbBDF1PEF4SEdP1KybbDN8FKnwpXWko6DzcCc42muSyoSBhcyzAsmU",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opGnYuYvLrcsrHKGMpTetwKZEVC1Kv3nH1St8AsVLMH38iaRNm6",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 22,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
              endorsement_power: 150,
            },
          },
        ],
        signature:
          "sigdAsnjNX9tK3SPkYfXXz5FrtPeTvmVfvtxKJZHFXJVyeoA5NGwtHCMSSyMV2T1G27r4bVuABGqpSRXh7xTR5nS15tM8Ar2",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onpi3hTurpp7Wr4cVANirPhGz5DyVTo8dk2XDDbt75fyrP1oqTG",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 27,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1MeT8NACB8Q4uV9dPQ3YxXBmYgapbxQxQ5",
              endorsement_power: 817,
            },
          },
        ],
        signature:
          "sigqVKcFoKuwThsFHwH148cQbD9FSzuANHkwvCn3FsyNoRwU29bHaFuxA149A3PHeto4meb4qKUcw1QQUnsqi3MWHY7HcCzG",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opBcK784Ys6fnx4qX4Evj2CWSheuBTSdxFyDMprggputkmGBsB2",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 35,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1PirbogVqfmBT9XCuYJ1KnDx4bnMSYfGru",
              endorsement_power: 117,
            },
          },
        ],
        signature:
          "sigP7EUFTSH3WXoTVmZsnt5GPFDn9RnGDtWBBbxbxxTq3Ue3v3bdppmHqj3yh8eRxL61ZUVcTprEXGX9Jib6GKJWjgmMj7TP",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "op7aUhDnkFnfYcheuWeQxDrg7RP841aNz7XqCvbvC63umJToRUh",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 36,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1RJ74UepJA9tigjoEeUEFajowzVB3QQaVx",
              endorsement_power: 142,
            },
          },
        ],
        signature:
          "sigg4GY3GzGnbU44Wpu1o9FyRcw5m5iU83F8C5S7iR132DnF4KXsE5XauvicEwMsjB2362co8Vip93K9TU5TLdLPo1Hd7V2d",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oohmNFmwPpPQYT7jTAUoxDW5ZDhjD9tDCb2PutYcqvYg1zvJc59",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 46,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1hm7NuCGNSKZQLQSawjUnehJcX8yCBcCAq",
              endorsement_power: 157,
            },
          },
        ],
        signature:
          "sigqGwxSvtWBTfG8ug1wAxJiBL4W8VC1kwzo65jzCfwiSmSc6dJdKRpMvrP3cdhGzx5brzXggCJnHGHbQX928n5vdrGo5QFa",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ontwh87NFTFb7fPwrjuXLaqCCMbNY7KmwiurFd1ohg2qd2bD6kg",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 50,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1KkJtLB9pMdLKNpVRNZw9zmysrxKmYcRGU",
              endorsement_power: 158,
            },
          },
        ],
        signature:
          "sigmwzzEQqCzHGsv4C6TeEpcjtXBzk9JgWHw7Lju3wbXCSGSnUe9rAM48qNgA1zfpD2J4BZW4hDAaQGfQgEP1UFuhLmGC3s8",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooRS6ReztJo3G17gDc9E24BviG9VyfMMWoErwuJxKJEpR7KgcHc",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 54,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1cg5EqC3WdZgRSvGJeW328S4KQNrT4jvyv",
              endorsement_power: 255,
            },
          },
        ],
        signature:
          "sigS3E6GMKycT5k1SefMxwqXYX5kTAfqmtbNkugKzFpSyV1YadC4VUV9RbNhyKqJKzog61aoFfByTXPBnPeuT1qxKUd8xt4Z",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "op2r2y6ypLHtHDStrBtUrkXpeGCJM6sXqx8WSACaXhemUqEeKeM",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 55,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
              endorsement_power: 163,
            },
          },
        ],
        signature:
          "sigixx3U9tSgepur4m3HvjhHgxPrfjjS4yzwSz9EKS5by3eGhP3pfpv3eFXbSCEa8BaC14H4V6eRuNWpPJ2erLGxR3VnVKfP",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onu3ayLfRHdaefjANkfzaRsWE88XaTqCfJw6mpx7a5BgfhiJUiu",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 62,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1Zt8QQ9aBznYNk5LUBjtME9DuExomw9YRs",
              endorsement_power: 148,
            },
          },
        ],
        signature:
          "sigZ3yyzddvF26aDx3v37W5LBC2iUTM158NdqicTe5RAU6XAWLL8iQ6mFmpJyA4k67SNQ45j6hZnDjj1ubQxz1me1W34w9TE",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oooPvm1rTXsMSxjC6f9ZuyqYYuAjJSToQfjQFjVyxmkYPFkxnLy",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 73,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1XMiZwHpHZ8a1AfwRWKfzLskJgZNyV8PHs",
              endorsement_power: 153,
            },
          },
        ],
        signature:
          "siguUmv7nHr15CzQcTQC8Dxs7BcsKbZt7ZQzX5GUPA5pDHtdKjrZET7L6vuPWkB1x93SP2KubJoopGsH35TYzaLJLfHskNdy",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooDwboYT32iVVX2Bq7sJR1b3P3V7eHL9JGUit5tQbj2KVLRgujU",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 130,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1NFs6yP2sXd5vAAbR43bbDRpV2nahDZope",
              endorsement_power: 127,
            },
          },
        ],
        signature:
          "sigULDooSCEMifKoofLfjYTbj1UUNnMGDNzoGRnkG5XTzh9CpPGSjgtvZLoRo12pvBgJBw2jj4zaN7Tn5enhhDv1YwjSBMDL",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opDn6jowfiwH7XsUgmZHLNrzpKn7k4JhsStvBxsiybm1Gez9mwG",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 156,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1MvCE9dczhoij2bd4sLL2AfVuMtWfFAoCN",
              endorsement_power: 155,
            },
          },
        ],
        signature:
          "sigqe91VvkoP6kA3YpHFzxy4NKsaHefhpAzGSvqkCUWcvZR9U8LWwUQX1QMeoLm2vUdgb8aSbtn1btmaic9gU2gdrPDsxzah",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onwRjpqPD67DejpbhDP3aRhkjARSfrKmKxR1jSQtN6QUnMptgkL",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 257,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1NGS7FEGGfEFp5XRVkHBqVqSQ8VuumF9j3",
              endorsement_power: 37,
            },
          },
        ],
        signature:
          "sigsVXJjWU1vNyqS5VNzNtVpVXKEnXnv4f7QeEZjw2YbYU7ppEMnBidWc6fzZ1Q4oJMxuFMDHdBxSm42GY6e4vmKFzS6d661",
      },
      {
        protocol: "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooukaVoqzNSMXnf6BfxvkAzVCv29FkqN6ttUd15WGxSwykRZZeC",
        branch: "BM3qpon1xnNR5KJu8Pcet1Ktp4jqdGSFqrwtup9ZfFSBcA31b3H",
        contents: [
          {
            kind: "endorsement",
            slot: 3909,
            level: 93515,
            round: 0,
            block_payload_hash:
              "vh33aE9R5FEsJGmwrXJuJMvmWiy1PZ72BARkCCu3eNxrP5bX2nYp",
            metadata: {
              balance_updates: [],
              delegate: "tz1SFbdg2jjkixHNU1Jm9f8JA4pYnMXsgATC",
              endorsement_power: 1,
            },
          },
        ],
        signature:
          "siga68EfVfgmmxyJhPtRUVaLZuPDbYhFdWaQCZyAsimqhS82vEU6w5gQbthbBNruT9xJwzDwXpGWwBnMmo2QTtQhT8Y6R67s",
      },
    ],
    [],
    [],
    [],
  ],
};

export default block;
