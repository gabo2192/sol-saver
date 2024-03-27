export type SolSaver = {
  version: '0.1.0';
  name: 'sol_saver';
  instructions: [
    {
      name: 'initPool';
      accounts: [
        {
          name: 'poolState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'externalVaultDestination';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programAuthority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'initPoolToken';
      accounts: [
        {
          name: 'poolState';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'programAuthority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'vaultAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'initStakeEntry';
      accounts: [
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userStakeEntry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'initTokenStakeEntry';
      accounts: [
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userStakeEntry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolState';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'stake';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'externalSolDestination';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userStakeEntry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'stakeAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'stakeToken';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'userStakeEntry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'stakeAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'unstake';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'externalSolDestination';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'user';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStakeEntry';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'poolState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'totalStakedSol';
            type: 'u64';
          },
          {
            name: 'initializedAt';
            type: 'i64';
          },
          {
            name: 'lastRewardTimestamp';
            type: 'i64';
          },
          {
            name: 'userDepositAmt';
            type: 'u64';
          },
          {
            name: 'externalVaultDestination';
            type: 'publicKey';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
        ];
      };
    },
    {
      name: 'tokenPoolState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'tokenVault';
            type: 'publicKey';
          },
          {
            name: 'tokenMint';
            type: 'publicKey';
          },
          {
            name: 'initializedAt';
            type: 'i64';
          },
          {
            name: 'vaultBump';
            type: 'u8';
          },
          {
            name: 'vaultAuthBump';
            type: 'u8';
          },
          {
            name: 'vaultAuthority';
            type: 'publicKey';
          },
          {
            name: 'distributionRate';
            type: 'u128';
          },
          {
            name: 'userDepositAmt';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'stakeEntry';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'user';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'balance';
            type: 'u64';
          },
          {
            name: 'lastStaked';
            type: 'i64';
          },
          {
            name: 'initialDistributionRate';
            type: 'u64';
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'InvalidProgramAuthority';
      msg: 'Incorrect program authority';
    },
    {
      code: 6001;
      name: 'InvalidMint';
      msg: 'Token mint is invalid';
    },
    {
      code: 6002;
      name: 'InvalidUser';
      msg: 'Invalid user provided';
    },
    {
      code: 6003;
      name: 'InsufficientFunds';
      msg: 'Insufficient funds';
    },
  ];
};

export const IDL: SolSaver = {
  version: '0.1.0',
  name: 'sol_saver',
  instructions: [
    {
      name: 'initPool',
      accounts: [
        {
          name: 'poolState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'externalVaultDestination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programAuthority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initPoolToken',
      accounts: [
        {
          name: 'poolState',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'programAuthority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'vaultAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initStakeEntry',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userStakeEntry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initTokenStakeEntry',
      accounts: [
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userStakeEntry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'poolState',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'stake',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'externalSolDestination',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userStakeEntry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'stakeAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'stakeToken',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'userStakeEntry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userTokenAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'stakeAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'unstake',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'externalSolDestination',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'user',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userStakeEntry',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'poolState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'totalStakedSol',
            type: 'u64',
          },
          {
            name: 'initializedAt',
            type: 'i64',
          },
          {
            name: 'lastRewardTimestamp',
            type: 'i64',
          },
          {
            name: 'userDepositAmt',
            type: 'u64',
          },
          {
            name: 'externalVaultDestination',
            type: 'publicKey',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
        ],
      },
    },
    {
      name: 'tokenPoolState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'amount',
            type: 'u64',
          },
          {
            name: 'tokenVault',
            type: 'publicKey',
          },
          {
            name: 'tokenMint',
            type: 'publicKey',
          },
          {
            name: 'initializedAt',
            type: 'i64',
          },
          {
            name: 'vaultBump',
            type: 'u8',
          },
          {
            name: 'vaultAuthBump',
            type: 'u8',
          },
          {
            name: 'vaultAuthority',
            type: 'publicKey',
          },
          {
            name: 'distributionRate',
            type: 'u128',
          },
          {
            name: 'userDepositAmt',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'stakeEntry',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'user',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'balance',
            type: 'u64',
          },
          {
            name: 'lastStaked',
            type: 'i64',
          },
          {
            name: 'initialDistributionRate',
            type: 'u64',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidProgramAuthority',
      msg: 'Incorrect program authority',
    },
    {
      code: 6001,
      name: 'InvalidMint',
      msg: 'Token mint is invalid',
    },
    {
      code: 6002,
      name: 'InvalidUser',
      msg: 'Invalid user provided',
    },
    {
      code: 6003,
      name: 'InsufficientFunds',
      msg: 'Insufficient funds',
    },
  ],
};
