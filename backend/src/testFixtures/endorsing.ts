import { EndorsingRightsResponse, OperationEntry, OpKind } from "@taquito/rpc";

export const baker = "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1";
export const level = 1318230;

export const successfulEndorsement: OperationEntry = {
  protocol: "PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo",
  chain_id: "NetXdQprcVkpaWU",
  hash: "opEcYqxb9HYvdQE5jLvazmpdk93f8M7dcQMdh33mpqDQeC3rDdF",
  branch: "BLA3CjVsLUWzvf4GbfMKTqXStUB3Hon526hsdTFB6cF3AFRY4Hn",
  contents: [
    {
      kind: OpKind.ENDORSEMENT,
      level: 1318230,
      metadata: {
        balance_updates: [
          {
            kind: "contract",
            contract: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
            change: "-64000000",
          },
          {
            kind: "freezer",
            category: "deposits",
            delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
            cycle: 321,
            change: "64000000",
          },
          {
            kind: "freezer",
            category: "rewards",
            delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
            cycle: 321,
            change: "1250000",
          },
        ],
        delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
        slots: [17],
      },
    },
  ],
  signature:
    "siggw64btFC4MAMdpuN9vYUz7yQfEiFsyHxm152nnyvVh2gmhZuj3rmXdsBZy6bMCT479qaEf4CoLdj3cesHdcG8GANrWvC6",
};

export const endorsementsWithMiss: OperationEntry[] = [
  {
    protocol: "PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo",
    chain_id: "NetXdQprcVkpaWU",
    hash: "oneKm4rbM1hC4k2UVhq1MrJPMq6RHJotKwKWt4oEdJm3VXmG7ub",
    branch: "BLA3CjVsLUWzvf4GbfMKTqXStUB3Hon526hsdTFB6cF3AFRY4Hn",
    contents: [
      {
        kind: OpKind.ENDORSEMENT,
        level: 1318230,
        metadata: {
          balance_updates: [
            {
              kind: "contract",
              contract: "tz1S8MNvuFEUsWgjHvi3AxibRBf388NhT1q2",
              change: "-128000000",
            },
            {
              kind: "freezer",
              category: "deposits",
              delegate: "tz1S8MNvuFEUsWgjHvi3AxibRBf388NhT1q2",
              cycle: 321,
              change: "128000000",
            },
            {
              kind: "freezer",
              category: "rewards",
              delegate: "tz1S8MNvuFEUsWgjHvi3AxibRBf388NhT1q2",
              cycle: 321,
              change: "2500000",
            },
          ],
          delegate: "tz1S8MNvuFEUsWgjHvi3AxibRBf388NhT1q2",
          slots: [8, 0],
        },
      },
    ],
    signature:
      "sigbJwj4ZMkbd61qtSURkdmY3bSXT8Mx34KGZDZyXP5wz8eZMr475WyZrBTFe5dgSTmmTPqwr4C7qnPC1Jtf45dxtfs7HLWL",
  },
  {
    protocol: "PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo",
    chain_id: "NetXdQprcVkpaWU",
    hash: "ooYqdUc8LWn4j6pKFc4wPFWLaGnuxCZEE9p4StZXXPoyxRAXf9a",
    branch: "BLA3CjVsLUWzvf4GbfMKTqXStUB3Hon526hsdTFB6cF3AFRY4Hn",
    contents: [
      {
        kind: OpKind.ENDORSEMENT,
        level: 1318230,
        metadata: {
          balance_updates: [
            {
              kind: "contract",
              contract: "tz2FCNBrERXtaTtNX6iimR1UJ5JSDxvdHM93",
              change: "-64000000",
            },
            {
              kind: "freezer",
              category: "deposits",
              delegate: "tz2FCNBrERXtaTtNX6iimR1UJ5JSDxvdHM93",
              cycle: 321,
              change: "64000000",
            },
            {
              kind: "freezer",
              category: "rewards",
              delegate: "tz2FCNBrERXtaTtNX6iimR1UJ5JSDxvdHM93",
              cycle: 321,
              change: "1250000",
            },
          ],
          delegate: "tz2FCNBrERXtaTtNX6iimR1UJ5JSDxvdHM93",
          slots: [16],
        },
      },
    ],
    signature:
      "sigSXPVc3CH9ksE9cJW6YfKStyuLoZjTuYQYdwjMj1zFCawDu1WDvxHJbmTjfavcEFinthJJDpNjzoGBrA158F7jsauJ7XEP",
  },
  {
    protocol: "PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo",
    chain_id: "NetXdQprcVkpaWU",
    hash: "ooFeS9g5RNBfvmxMy69i26a5XTiGoeNaR1kuNBBtohF6CPKfWzF",
    branch: "BLA3CjVsLUWzvf4GbfMKTqXStUB3Hon526hsdTFB6cF3AFRY4Hn",
    contents: [
      {
        kind: OpKind.ENDORSEMENT,
        level: 1318230,
        metadata: {
          balance_updates: [
            {
              kind: "contract",
              contract: "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV",
              change: "-128000000",
            },
            {
              kind: "freezer",
              category: "deposits",
              delegate: "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV",
              cycle: 321,
              change: "128000000",
            },
            {
              kind: "freezer",
              category: "rewards",
              delegate: "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV",
              cycle: 321,
              change: "2500000",
            },
          ],
          delegate: "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV",
          slots: [20, 14],
        },
      },
    ],
    signature:
      "sigYW8tzPYbSM5i5H2r8cUEvH7KawEqTyp2uXHNbyLdL8sv5D1tMXvZXhcq3GML9CQCdJGUxfB11Y8Xfhy8pBnTmRu95bGkk",
  },
  {
    protocol: "PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo",
    chain_id: "NetXdQprcVkpaWU",
    hash: "onzSwuu914ufW1WNNXy4KZm6bxaUgrP3AwNpNKK3Kh5argXZeDc",
    branch: "BLA3CjVsLUWzvf4GbfMKTqXStUB3Hon526hsdTFB6cF3AFRY4Hn",
    contents: [
      {
        kind: OpKind.ENDORSEMENT,
        level: 1318230,
        metadata: {
          balance_updates: [
            {
              kind: "contract",
              contract: "tz1Vc9XAD7iphycJoRwE1Nxx5krB9C7XyBu5",
              change: "-64000000",
            },
            {
              kind: "freezer",
              category: "deposits",
              delegate: "tz1Vc9XAD7iphycJoRwE1Nxx5krB9C7XyBu5",
              cycle: 321,
              change: "64000000",
            },
            {
              kind: "freezer",
              category: "rewards",
              delegate: "tz1Vc9XAD7iphycJoRwE1Nxx5krB9C7XyBu5",
              cycle: 321,
              change: "1250000",
            },
          ],
          delegate: "tz1Vc9XAD7iphycJoRwE1Nxx5krB9C7XyBu5",
          slots: [25],
        },
      },
    ],
    signature:
      "sigw2sVMQxJB2kGWAY3bES2KgVrA4FLDqDvNvuSPuPtu3b3jAzfdZDiJ7P7JLnNK6ZE6hUZXGytiin5sYakgf14SSvnf7mm2",
  },
  {
    protocol: "PsDELPH1Kxsxt8f9eWbxQeRxkjfbxoqM52jvs5Y5fBxWWh4ifpo",
    chain_id: "NetXdQprcVkpaWU",
    hash: "opR15ca7Nne1kSn9J2yWNL3KFq3PqswUbGf3sjYXn5TNZGhPnrF",
    branch: "BLA3CjVsLUWzvf4GbfMKTqXStUB3Hon526hsdTFB6cF3AFRY4Hn",
    contents: [
      {
        kind: OpKind.ENDORSEMENT,
        level: 1318230,
        metadata: {
          balance_updates: [
            {
              kind: "contract",
              contract: "tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM",
              change: "-192000000",
            },
            {
              kind: "freezer",
              category: "deposits",
              delegate: "tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM",
              cycle: 321,
              change: "192000000",
            },
            {
              kind: "freezer",
              category: "rewards",
              delegate: "tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM",
              cycle: 321,
              change: "3750000",
            },
          ],
          delegate: "tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM",
          slots: [18, 10, 9],
        },
      },
    ],
    signature:
      "sigR62M6wREB4RsFTcKxx8fLpDvae6s1PaWZ6dJW55XQGxAnxn9a1Jhugu72kbsfFQiySXDujm76Xtby4yswFjdsSt1uQHZz",
  },
];

export const endorsementsWithSuccess = [
  ...endorsementsWithMiss,
  successfulEndorsement,
];

export const endorsingRightsResponse: EndorsingRightsResponse = [
  {
    level: 1318230,
    delegate: "tz3bvNMQ95vfAYtG8193ymshqjSvmxiCUuR5",
    slots: [19, 3],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz3bTdwZinP8U1JmSweNzVKhmwafqWmFWRfk",
    slots: [4, 1],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz3VEZ4k6a4Wx42iyev6i2aVAptTRLEAivNN",
    slots: [21],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz3UoffC7FG7zfpmvmjUmUeAaHvzdcUvAj6r",
    slots: [22, 2],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz3RDC3Jdn4j15J7bBHZd29EUee9gVB1CxD9",
    slots: [23, 15],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz3RB4aoyjov4KEVRbuhvQ1CKJgBJMWhaeB8",
    slots: [30, 5],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz3QCNyySViKHmeSr45kzDxzchys7NiXCWoa",
    slots: [29],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz3NExpXn9aPNZPorRE4SdjJ2RGrfbJgMAaV",
    slots: [20, 14],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz2FCNBrERXtaTtNX6iimR1UJ5JSDxvdHM93",
    slots: [16],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1irJKkXS2DBWkU1NnmFQx1c1L7pbGg4yhk",
    slots: [13, 12],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1gfArv665EUkSg2ojMBzcbfwuPxAvqPvjo",
    slots: [28],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1eEnQhbwf6trb8Q8mPb2RaPkNk2rN7BKi8",
    slots: [27],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1aRoaRhSpRYvFdyvgWLL6TGyRoGF51wDjM",
    slots: [18, 10, 9],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1Y7tsDmwrJocSt81Nt8apH1h6LnehMLRiH",
    slots: [26],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1WpeqFaBG9Jm73Dmgqamy8eF8NWLz9JCoY",
    slots: [6],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1Vc9XAD7iphycJoRwE1Nxx5krB9C7XyBu5",
    slots: [25],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1VHFxUuBhwopxC9YC9gm5s2MHBHLyCtvN1",
    slots: [17],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1S8MNvuFEUsWgjHvi3AxibRBf388NhT1q2",
    slots: [8, 0],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1PWCDnz783NNGGQjEFFsHtrcK5yBW4E2rm",
    slots: [24],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1NHJkUcjHwSGHviyrk2WzpXk2c9uYMKknD",
    slots: [7],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1MXFrtZoaXckE41bjUCSjAjAap3AFDSr3N",
    slots: [31],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
  {
    level: 1318230,
    delegate: "tz1Ldzz6k1BHdhuKvAtMRX7h5kJSMHESMHLC",
    slots: [11],
    estimated_time: new Date("2021-01-26T15:27:34Z"),
  },
];
