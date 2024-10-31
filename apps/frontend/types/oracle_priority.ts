/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/oracle_priority.json`.
 */
export type OraclePriority = {
  "address": "AAriC4q8b2hLfft31c4oPiWXgDwyxN7mmv8MzUeaddcq",
  "metadata": {
    "name": "oraclePriority",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "getPrice",
      "discriminator": [
        238,
        38,
        193,
        106,
        228,
        32,
        210,
        33
      ],
      "accounts": [
        {
          "name": "oracleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "oracle_info.vault_type",
                "account": "oracleInfo"
              },
              {
                "kind": "const",
                "value": [
                  79,
                  114,
                  97,
                  99,
                  108,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "pythPriceInfo"
        },
        {
          "name": "switchboardFeedInfo"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "oracleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "vaultType"
              },
              {
                "kind": "const",
                "value": [
                  79,
                  114,
                  97,
                  99,
                  108,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "vaultType"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaultTypeName",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateOracles",
      "discriminator": [
        209,
        115,
        103,
        72,
        108,
        69,
        218,
        189
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "oracleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "oracle_info.vault_type",
                "account": "oracleInfo"
              },
              {
                "kind": "const",
                "value": [
                  79,
                  114,
                  97,
                  99,
                  108,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "pythOracle",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "switchboardOracle",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updatePriority",
      "discriminator": [
        167,
        202,
        19,
        134,
        17,
        163,
        64,
        139
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "oracleInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "oracle_info.vault_type",
                "account": "oracleInfo"
              },
              {
                "kind": "const",
                "value": [
                  79,
                  114,
                  97,
                  99,
                  108,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "pythPriority",
          "type": "i8"
        },
        {
          "name": "switchboardPriority",
          "type": "i8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "oracleInfo",
      "discriminator": [
        96,
        11,
        41,
        213,
        74,
        10,
        238,
        12
      ]
    },
    {
      "name": "priceUpdateV2",
      "discriminator": [
        34,
        241,
        35,
        99,
        157,
        126,
        244,
        205
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidPriorities",
      "msg": "Invalid oracle priorities configuration"
    },
    {
      "code": 6001,
      "name": "noPriceAvailable",
      "msg": "No price available from configured oracles"
    }
  ],
  "types": [
    {
      "name": "oracleInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultType",
            "type": "pubkey"
          },
          {
            "name": "oraclePyth",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "oracleSwitchboard",
            "type": "pubkey"
          },
          {
            "name": "priorityPyth",
            "type": "i8"
          },
          {
            "name": "prioritySwitchboard",
            "type": "i8"
          },
          {
            "name": "vaultTypeName",
            "type": "string"
          },
          {
            "name": "recentPrice",
            "type": "u128"
          },
          {
            "name": "lastUpdate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "priceFeedMessage",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feedId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "price",
            "type": "i64"
          },
          {
            "name": "conf",
            "type": "u64"
          },
          {
            "name": "exponent",
            "type": "i32"
          },
          {
            "name": "publishTime",
            "docs": [
              "The timestamp of this price update in seconds"
            ],
            "type": "i64"
          },
          {
            "name": "prevPublishTime",
            "docs": [
              "The timestamp of the previous price update. This field is intended to allow users to",
              "identify the single unique price update for any moment in time:",
              "for any time t, the unique update is the one such that prev_publish_time < t <= publish_time.",
              "",
              "Note that there may not be such an update while we are migrating to the new message-sending logic,",
              "as some price updates on pythnet may not be sent to other chains (because the message-sending",
              "logic may not have triggered). We can solve this problem by making the message-sending mandatory",
              "(which we can do once publishers have migrated over).",
              "",
              "Additionally, this field may be equal to publish_time if the message is sent on a slot where",
              "where the aggregation was unsuccesful. This problem will go away once all publishers have",
              "migrated over to a recent version of pyth-agent."
            ],
            "type": "i64"
          },
          {
            "name": "emaPrice",
            "type": "i64"
          },
          {
            "name": "emaConf",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "priceUpdateV2",
      "docs": [
        "A price update account. This account is used by the Pyth Receiver program to store a verified price update from a Pyth price feed.",
        "It contains:",
        "- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different price update.",
        "- `verification_level`: The [`VerificationLevel`] of this price update. This represents how many Wormhole guardian signatures have been verified for this price update.",
        "- `price_message`: The actual price update.",
        "- `posted_slot`: The slot at which this price update was posted."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "writeAuthority",
            "type": "pubkey"
          },
          {
            "name": "verificationLevel",
            "type": {
              "defined": {
                "name": "verificationLevel"
              }
            }
          },
          {
            "name": "priceMessage",
            "type": {
              "defined": {
                "name": "priceFeedMessage"
              }
            }
          },
          {
            "name": "postedSlot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "verificationLevel",
      "docs": [
        "Pyth price updates are bridged to all blockchains via Wormhole.",
        "Using the price updates on another chain requires verifying the signatures of the Wormhole guardians.",
        "The usual process is to check the signatures for two thirds of the total number of guardians, but this can be cumbersome on Solana because of the transaction size limits,",
        "so we also allow for partial verification.",
        "",
        "This enum represents how much a price update has been verified:",
        "- If `Full`, we have verified the signatures for two thirds of the current guardians.",
        "- If `Partial`, only `num_signatures` guardian signatures have been checked.",
        "",
        "# Warning",
        "Using partially verified price updates is dangerous, as it lowers the threshold of guardians that need to collude to produce a malicious price update."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "partial",
            "fields": [
              {
                "name": "numSignatures",
                "type": "u8"
              }
            ]
          },
          {
            "name": "full"
          }
        ]
      }
    }
  ]
};
