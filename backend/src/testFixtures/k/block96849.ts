import { BlockK } from "../../rpc/types";

const block: BlockK = {
  protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
  chain_id: "NetXnHfVqm9iesp",
  hash: "BMDNHdGFNvVUaPPLZ2LsW8PNSsQsKQTNPxjfRnPGm9av4dLVJ1w",
  header: {
    level: 96849,
    proto: 2,
    predecessor: "BLkJ5dFZ4agtoN35pEYKyDzrP2XwbwJzWw4QLtopCQB8et5XPwa",
    timestamp: "2022-02-16T13:34:50Z",
    validation_pass: 4,
    operations_hash: "LLoaTPHy1AkT8z4KT9VYPWiKagds72Hsj7pinPoWWNCJHiyxZFi1u",
    fitness: ["02", "00017a51", "", "ffffffff", "00000000"],
    context: "CoWFfCiET7ie9mX4vSLXLB8dmkniSZAzJaD7TJwjW3wXKviXZ5MR",
    payload_hash: "vh33BdpsBGpCasd3egMmEtJf7dvpTembDD359Dv68B3oZRXT3NpT",
    payload_round: 0,
    proof_of_work_nonce: "7985fafe15c90100",
    liquidity_baking_toggle_vote: "on",
    signature:
      "sigjHbkEKYahsHVikK1hS8VbadhSw3y8CszryeMMgR3S3PjA8uE1SF75LnBAvCTx2WXcMvgtWBSSNrFcgZW6qdd6AyhuzahC",
  },
  metadata: {
    protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
    next_protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
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
    proposer: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
    baker: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
    level_info: {
      level: 96849,
      level_position: 96848,
      cycle: 23,
      cycle_position: 2640,
      expected_commitment: false,
    },
    voting_period_info: {
      voting_period: {
        index: 4,
        kind: "proposal",
        start_position: 81920,
      },
      position: 14928,
      remaining: 5551,
    },
    nonce_hash: null,
    consumed_milligas: "",
    liquidity_baking_toggle_ema: 120140,
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
        contract: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
        change: "5000000",
        origin: "block",
      },
      {
        kind: "minted",
        category: "baking bonuses",
        change: "-4228139",
        origin: "block",
      },
      {
        kind: "contract",
        contract: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
        change: "4228139",
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
            int: "242120000100",
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
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooSvfaGk5zHMzJveGHghxS5xEvZM4PcuppWzGBvemEU43cPkQP4",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 0,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
              endorsement_power: 197,
            },
          },
        ],
        signature:
          "sigS2AHafQKkUJyjnCnXQBV9h6Qm3Q753QgQykrb8m6zqyenBQztFT8KGFHRjP8uEDZbwv7L3bGADEHRU7w8QujTFBevMDkA",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooANVvgnMJmUbJ9iv76vdTp9cbWmXDX25FMF53M3XQmazVUAoAU",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 2,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1RuHDSj9P7mNNhfKxsyLGRDahTX5QD1DdP",
              endorsement_power: 116,
            },
          },
        ],
        signature:
          "sigZ3CADKg5HgGxgutwQSpZwsvtDMgXxD66K8GKXBQevQ6i7FqDMVtmQEAanvUadhfFvHEDqcBGU5yynbi689XgfhTj3tZWf",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onrqjNJDz7obLw3K3omTAxoBMocQs48MkTnvEPjhiDAePGFevvf",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 3,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9",
              endorsement_power: 1191,
            },
          },
        ],
        signature:
          "sigP2veAJ5fLojoG8nLfDcQN9nQSWm4MggWyZemqq7viUFr6WS13U4oUQ55SHb1Dr4fmbpd3xeWT2vq7WVEE3AfAPX2s5o4t",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opBKzSed3DUz7M9z2nZYrhcsz4J87Mm3whFwuwpzrVzXBer2LTF",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 4,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1foXHgRzdYdaLgX6XhpZGxbBv42LZ6ubvE",
              endorsement_power: 233,
            },
          },
        ],
        signature:
          "sigpnJGdyPVsbZRVSMKgMF31SUz7iAyxcqYXwtteiRBtvtXEyRfmTjGkA5G7WghNHTGVzhoY6gsVGthBnQDWq1JddiNQB2DG",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opFzXh72HqEqCxaa4PMrcEcb14yqVZ3R5rgZhvKBGDWth4jJ1GT",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 6,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1MeT8NACB8Q4uV9dPQ3YxXBmYgapbxQxQ5",
              endorsement_power: 833,
            },
          },
        ],
        signature:
          "sigpX9m8Uwa7ouQfvf55mm6313W2JWhPsukJrJ1hyYWy6PEpLwK82v3RaDT8Qwog5VaW8KHn88b3cDovGgNuApTi3Bb21vTT",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opHL8mhrZYN81EkEmWbU6qjEFoBWv94jJGGTuxr5y5Y5YmXoWFD",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 8,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1RJ74UepJA9tigjoEeUEFajowzVB3QQaVx",
              endorsement_power: 126,
            },
          },
        ],
        signature:
          "sigPDyM7R5WqDeRBY36Y7kRBjdZ72819NyEeMkFGF7auQDUqzkrTQUh5DEpoFRGXSTMSyneJNPKt48N5tHSEUcLJoYRY1ocF",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "op78sgHhxvbVHG8Y24nJKbU2yddbs6fzkSzm6xDbUJsxUNLorVY",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 9,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1iZ9LkpAhN8X1L6RpBtfy3wxpEWzFrXz8j",
              endorsement_power: 192,
            },
          },
        ],
        signature:
          "sigvC7raZZ3LvpmLmzevyAugryaya4zwsGq5v63Wj28ALbDdGN2SWtJCbyURrzUatf6jFyJrxkmvJf8WWRTZ52DhkCKp14XA",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooU4BhJwCk21VrhYCruGPTWiQMfjgmDdDkMwVyZ76gecYpAVEs3",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 10,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1hm7NuCGNSKZQLQSawjUnehJcX8yCBcCAq",
              endorsement_power: 156,
            },
          },
        ],
        signature:
          "sigp9aeExQFT9Nz8Gx9G2xVAkWe5FZQtVWsRLxi7DJgXdBNvvEPsSLUWmu3Ed327xRhj8rfgvVdNwihfDZNGNgxsYnDHUQkM",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooyPeGLLPrGdaw5izEfFC5CPgg4V3xxBgWjwAo8nrMr5TEk7Cd3",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 11,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1Wn7JnLVf7PpTbaLQNzmNaF9z9UudWHGBR",
              endorsement_power: 137,
            },
          },
        ],
        signature:
          "sigtJ9Kt5KxX96Be6sJjonnBW8tYZBpoVQmkqgUgTEDHbEKUC8E2PM9ER4U8K2j96DLVa1ch3QfdzoyNe315h7Hc9Y76iTLv",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opamUNf5vQHiAudE6qTAmJtepv24zX9wxToPSrzTDCk5Uioz6iZ",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 12,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1ituzNz9MGaMSL9dVDN7jE5SArCEWNmZbS",
              endorsement_power: 147,
            },
          },
        ],
        signature:
          "sigs3h39YCmWdsQnBvbX1wZJSDZANqdw6qAMye1GVdRdFDmhXJoyXmmKdBbDoBrFntcpc4Jr1Azj5sFonFvjsnR58xcQ9139",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onutag9rmK3UtvMex2NpFhJ82MAjGFBSRHuchRwzpLNpy97amPY",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 13,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1NFs6yP2sXd5vAAbR43bbDRpV2nahDZope",
              endorsement_power: 135,
            },
          },
        ],
        signature:
          "sigVwMh7EJD93zP2bJyMwuRQxyejYF2gmhZzuAzafuqegNw8TzC4qCAeeEmH2SH3HnaXDP6oDaGCuCNDiPGLaYSmvc8hbSRn",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oodQSU8qJMfUP9oMhjNxaz27ohuqA6oc7hTbUsojxT2ASyYXfa6",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 14,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1NiaviJwtMbpEcNqSP6neeoBYj8Brb3QPv",
              endorsement_power: 265,
            },
          },
        ],
        signature:
          "sigq3QjmVqNNfAKm5pGAUkS2BGRhQi65wnhfX9jHByGje7qDYKkU4Qg7vueSwTZVWe9L5sTS1S5dCPix8usbCbmZtVU1jM88",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oojysTWMpBNdDk1xXsNUDWuF1MPFaTHgGbyUDTdaugqVP4qvdyM",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 15,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1funU3PjPsuXvmtXMgnAckY1s4pNT6V7WJ",
              endorsement_power: 162,
            },
          },
        ],
        signature:
          "sigj8ko66VprC3Bjwwfs5VxcgFv57FggG8sznZn853hJ2izRzbGCmR58Kdceupd5vacgrJaCuyF5iLEMubETgg9reUPHkgEK",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opEmFj1AXZ6QmeNdh6PAu3tu8Jj5NwtSBW332LyRzKmcPuRefne",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 18,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1MvCE9dczhoij2bd4sLL2AfVuMtWfFAoCN",
              endorsement_power: 153,
            },
          },
        ],
        signature:
          "sigpsCnwsML6bdMvTuDtQxApXQgFEYphydRXdqrx2Kur9CxgGHAMBsQBwmjNED5zbws3rXjGMwvX37Y1v1JnRnu2V1ohqvqw",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oouGJQpUASAQiVzTpDs4N2XuZM6wgHNHBQW6SCQkYC673Ty7UMR",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 22,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1Zt8QQ9aBznYNk5LUBjtME9DuExomw9YRs",
              endorsement_power: 164,
            },
          },
        ],
        signature:
          "sigatabULpwnRuogrLGjnVsXn4aQHGV2U9rvCamQPMY4mQj9L3hUYGhnTsbnztNzDXuLQEqDPEjsQou4uC5aULpP1dhYAUBM",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onhcsSbQqYQyEjhuEqX6wvJ3zGhcMbgVnHa5HyrGq4dRyESZMtp",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 23,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1QXAAasy8TciwfvDC4a7MWo1tm3K37uN9Y",
              endorsement_power: 150,
            },
          },
        ],
        signature:
          "sigvH5QxARLKaJHTxaQY5GX8XQsPXQTFk4XT3QSUUh8R19FRSc514fpoW1scYvroUMFurgVcb9TP66RQU1Dnr5JBfMica4Hw",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oom1sN7zhb5QHFrZTWNn2xy4MkZk5dpgHpjBtGwm1UuBWoKpsXq",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 28,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1e42w8ZaGAbM3gucbBy8iRypdbnqUj7oWY",
              endorsement_power: 147,
            },
          },
        ],
        signature:
          "sigcj5BEkDQJfrFyzq8wpZDSYPB8EPyviDEMiNXrVmSgZyVk7rgzSAWizVgLpmtVLTg7izCGGJXNVfkhoyzSLHMc1RwnWqLK",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooYhybwCAYiJJb3LhSuXqYj2bzGEqgJCKxegresmoXbMJNusSr2",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 30,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1cjyja1TU6fiyiFav3mFAdnDsCReJ12hPD",
              endorsement_power: 132,
            },
          },
        ],
        signature:
          "sigmnQjQBd7vF1FczDbD9afNeNy8um8AFZYiiy5bdSYyPqFqpPiUx61SFn6bJkvrsy6qndCKYUxUyAd1FenE5xATUhReGEvd",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onw7GykdGCb8gzMBRQU3WkLqJAcDaCZF3pcJb24CKdN9D7ktRCu",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 33,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
              endorsement_power: 142,
            },
          },
        ],
        signature:
          "sigsaAa3grvznmSwLXV6sfu2yNBR2uREFWFKhF6B3cYnC9n3oakULUCLj2MqHzbYv1gkkqVe79gXcKCs4Hp6WTMGTKSG43mb",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooRmLm9GW91yc7ReRvs5TAYcCSJq3riaJaePhH1HAsUT54enyaN",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 36,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1KkJtLB9pMdLKNpVRNZw9zmysrxKmYcRGU",
              endorsement_power: 162,
            },
          },
        ],
        signature:
          "sigYnwgy6wyVkeMNBLGq9jHzPHN6ZtaAvDrosqUUoKbmYvQd9k2jsXPnYctEkGWq1TdY9ApsS4P3vgsPJdkUX43VF6yRMjgg",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opUmWS7Bx7aGTF5dhkjjmydpti865LKVHcYtvDoC555yuTgsNG2",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 38,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1NGS7FEGGfEFp5XRVkHBqVqSQ8VuumF9j3",
              endorsement_power: 28,
            },
          },
        ],
        signature:
          "sigX57g2StSQTfhZwi1fGZPCt5s1Y9HEeoqWjHc4bgjE31Ey2Q59BqsiLhS5abeBePPY8H5MoLpycfgu51GiVPjUbCiN2xub",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onk2AKLmKLQEW2W3Y5tJAqdSkKikhePPQ3PMrFh4PZ2fFAUHC2Y",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 40,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1PirbogVqfmBT9XCuYJ1KnDx4bnMSYfGru",
              endorsement_power: 121,
            },
          },
        ],
        signature:
          "sigZeurmhP3h2GSFPvvU4CKsnJCTuoViCGWPPc9S668tqYe6MKJ5CrEP7S7QZ61ypZSbz5UG9zH8NbHUgJhsoi5jewVv82HW",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo6rgmUtbAQjq7Am4FuRz4QZxe3ji3Tj6ej8zfeCnxHJ9NbaNsS",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 42,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1TGKSrZrBpND3PELJ43nVdyadoeiM1WMzb",
              endorsement_power: 152,
            },
          },
        ],
        signature:
          "siggNQAkdv6N6bztpVCY6qGgrtQvzR6Ubjk5DyQ73VAdTvEf8FpSyJKKtMrRvS8pU7mxPMJsiQ1r5y445WsseApg9JXUmRq5",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooj18msuRVxYKUTphqVANqFghDr5BxcBE11Vea8STzH8bmJVmvV",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 43,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1LQ32syCNyGj6FdAuJfko42Wep87iYZk8k",
              endorsement_power: 154,
            },
          },
        ],
        signature:
          "sigkTeo6kZzTHKmjDcrEkQE62d2hPuGm7nXxEgbfqpcHb2PuvX6UFEzz6cPbr4kLK8SWbZGFzgLd4wLkcQFtnRynsrLjgREM",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooXfAkdu4N4sX7dW4pmaJKN7bH87PusXpZ7ZXnNcM8n2ZNZ9w4Z",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 51,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1dqPQn5HXNJ7yjcqBx2w6sozjPXTV1kpfh",
              endorsement_power: 141,
            },
          },
        ],
        signature:
          "sigr8F5kVh3KCDU6ZtMYYg9qyg7W7Ms3PnN4Usz2z5KiKisMEK1qnDjpKXX8GT3FzNmzKcmKawJrJRZaeF9hNDkjhZmQweNe",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onsasRTB7WjbZTmUoQy3qNSJuGHmG2JzWcm2kXymXmH2yYZDEhJ",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 53,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1Q7YBzLJkw87c2FdwaWuGKyacSDc4QghzQ",
              endorsement_power: 156,
            },
          },
        ],
        signature:
          "sigvggydbU8gzgBxvPyVs2UWSXnmJERBWVmoYhnuT2DNoE32nUbiniixspxjuuRctWC8kXza9GusJfarqjAWMQqCGK2qEMLD",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opFkSShYRTmMvpKyMv3d5wVRJ52vA1rhBVGgfkbzj4JFuJprPEX",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 76,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1edUYGqBtteStneTGDBrQWTFmq9cnEELiW",
              endorsement_power: 142,
            },
          },
        ],
        signature:
          "sigQaCneMbEgeBNiAJWGvh9X9DoTTuGg3ppMQzNYdWPsPZoVigWS3WfJN1R7R6NprPZBW8Dvf4Ks42MV9z6w7aHQBxF6MWU6",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ooXQCbFGh4iY6USX3dQ9rW6XZpc47bF8S6oV7vfdzoik7mveemU",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 85,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1e841Z7k7XHSoTSyHyBHG2Gijv7DzzjEBb",
              endorsement_power: 138,
            },
          },
        ],
        signature:
          "sigZGVop8yw23rqyM8tz3CRu1fSzqqQV9iPFUe8A7rvWLP4GAaRcK1KC2fC5t9EmEZhWJrsm3RAr2Pyn4n5oMcTNxJyTLMHk",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onkcLZou9mNyhheos3tXnazLpn2HHgSNy6Ctufhn5wwVLWvvkJn",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 91,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1V9CRVyKP3roXsnjcFJP3p9DSXX63KL7iP",
              endorsement_power: 140,
            },
          },
        ],
        signature:
          "sigfEJR6WYAyXezSkq1ZoGGTQDrFg4vUd912y1CaaM7axiCUaUr7rok7frAz9ZYSoHnUSKGEFLjk1dgde9hJsFwGG5uoZsgt",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "oo3TkuoUtM2reSpdQHnGor4EBTg821a7NgBPqEiA4dRqwjFVeJg",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 98,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1XMiZwHpHZ8a1AfwRWKfzLskJgZNyV8PHs",
              endorsement_power: 140,
            },
          },
        ],
        signature:
          "sigsytXHDzCpVZ1e5W5qzTavY37za2GbP8sZyxYbzHxMWmWzMJ2idXEfxmQHyXk1igdmZKppY3xD5jRwCx8S8pJoFbysTAL5",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opGrHDizE8GTN6xZsAo1QurfwrFMws28GBZ9ywAVCfpGp5vWmLG",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 102,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1cg5EqC3WdZgRSvGJeW328S4KQNrT4jvyv",
              endorsement_power: 252,
            },
          },
        ],
        signature:
          "sigXzuFbpwvxuxJTdYFjRfpSLZ7CsAuBs7M2tf8R2LazyY6PTYcDE8nmKg24afsgQAFzQNpdUBj6RMnSjGqxmEnMhMZynJz4",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "onx3jsnERmeA9NVTPmJSmnFVUCWCXViKMgSHtWpC3VxQ8RFU9dW",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 126,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1RBECWBXv4tKcuDbxYmBguvdn8wzjrejHg",
              endorsement_power: 129,
            },
          },
        ],
        signature:
          "sigmZeSYg1zuQseVM4cg7HtzGaWn5N9ZefXPVedZwBaQSbFNa3GZh4Sz47S919FhCTrhppAnh1fkHWXjJoQjPbVZ7dj4XUTS",
      },
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "opKEQJ6PCApFQnLiLF9tEKj7oHQXEBvXRCc4pJNDA2WsDF5Wx2F",
        branch: "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
        contents: [
          {
            kind: "endorsement",
            slot: 600,
            level: 96848,
            round: 0,
            block_payload_hash:
              "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
            metadata: {
              balance_updates: [],
              delegate: "tz1SFbdg2jjkixHNU1Jm9f8JA4pYnMXsgATC",
              endorsement_power: 7,
            },
          },
        ],
        signature:
          "sigdKkpHgG8PMN5K9TBbu3NZdXerjzso72pozzeZVE3Vtb465zXKdQzaK9CMKuokUPhdNGwjK6DFCYNJmVUyWQHWW9vYJTNy",
      },
    ],
    [],
    [
      {
        protocol: "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
        chain_id: "NetXnHfVqm9iesp",
        hash: "ongosfGDxPYZVKch48B6vMEZGve3shTrJASsp5MNuM2L8E4b9Ev",
        branch: "BMPzGKw11b5n8EQJeWiUdQHuvV7mXv76yfJK2Uhm7D8gJ6v5dq8",
        contents: [
          {
            kind: "double_baking_evidence",
            bh1: {
              level: 96848,
              proto: 2,
              predecessor:
                "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
              timestamp: "2022-02-16T13:34:35Z",
              validation_pass: 4,
              operations_hash:
                "LLobAfKHvK8kNNe1C2hpZy8omghNaWcigjBpB9k14rTxVokTpfEg9",
              fitness: ["02", "00017a50", "", "ffffffff", "00000000"],
              context: "CoV5d2TRiYS6m8GPrsEKLUf7EcKoYUoPr49D6T57ALSRvBX8gq7t",
              payload_hash:
                "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
              payload_round: 0,
              proof_of_work_nonce: "df2ea592b68a0100",
              liquidity_baking_toggle_vote: "off",
              signature:
                "sigVPMjoqJoy2tYFKHjyiTWWREWZjgHVdiyECgofoJuvuW3ZHApeTvRk2XyBEEa6m34G92QpyRRHLp9Jt8fUbpRKQ2Zx6rP4",
            },
            bh2: {
              level: 96848,
              proto: 2,
              predecessor:
                "BM1QAJ1NBx8C1nQmCHqWd6dvvXX9nTfEAjVec3Cu83eoJUSSpSw",
              timestamp: "2022-02-16T13:34:35Z",
              validation_pass: 4,
              operations_hash:
                "LLobAfKHvK8kNNe1C2hpZy8omghNaWcigjBpB9k14rTxVokTpfEg9",
              fitness: ["02", "00017a50", "", "ffffffff", "00000000"],
              context: "CoV5d2TRiYS6m8GPrsEKLUf7EcKoYUoPr49D6T57ALSRvBX8gq7t",
              payload_hash:
                "vh2z79SC5KAfDM8tbxpnk58WxZVPeZJrxyH79whLj8AYF5iHQbz7",
              payload_round: 0,
              proof_of_work_nonce: "df2ea592b68a0100",
              liquidity_baking_toggle_vote: "off",
              signature:
                "sigQMuzeJ5A6aYxF74tA7HNBJn1Yqtm6UhoZ7C9tw4oJ5T2Gs5r3MqVLkjTwya1gXs7rfcHDxdum8NLHR7M565XsQkuaghzp",
            },
            metadata: {
              balance_updates: [
                {
                  kind: "minted",
                  category: "double signing evidence rewards",
                  change: "-320000000",
                  origin: "block",
                },
                {
                  kind: "contract",
                  contract: "tz1cXeGHP8Urj2pQRwpAkCdPGbCdqFUPsQwU",
                  change: "320000000",
                  origin: "block",
                },
                {
                  kind: "freezer",
                  category: "deposits",
                  delegate: "tz3Q67aMz7gSMiQRcW729sXSfuMtkyAHYfqc",
                  change: "-640000000",
                  origin: "block",
                },
                {
                  kind: "burned",
                  category: "punishments",
                  change: "640000000",
                  origin: "block",
                },
              ],
            },
          },
        ],
      },
    ],
    [],
  ],
};

export default block;
