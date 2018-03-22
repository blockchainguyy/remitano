#!/usr/bin/env node
const program = require("commander");
const storage = require("node-persist");
const bitcoin = require("bitcoinjs-lib");
const bch = require("bitcoincashjs");
const blocktrail = require("blocktrail-sdk");

program
  .arguments("<action>")
  .option(
    "-h, --holder <holder name>",
    "\n Holder to save address and private key generated \n"
  )
  .option(
    "-p, --privateKey <name for private key of a pre defined holder>",
    "\n Name for private key of a pre defined holder (<holder name>.priv) \n This private key will belong to sender of the transaction \n Compatible only to use with move-bch action \n"
  )
  .option(
    "-a, --address <name for address of a pre defined holder>",
    "\n Name for address of a pre defined holder (<holder name>addr) \n This private key will belong to sender of the transaction \n Compatible only to use with move-bch action \n"
  )
  .action(action => {
    if (action === "generate-segwit") {
      if (program.holder == undefined) {
        return console.log("Error: need -h flag, i.e. holder name");
      }

      const testnet = bitcoin.networks.testnet;

      const keyPair = bitcoin.ECPair.makeRandom({ network: testnet });
      const pubKey = keyPair.getPublicKeyBuffer();

      const redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(
        bitcoin.crypto.hash160(pubKey)
      );
      const scriptPubKey = bitcoin.script.scriptHash.output.encode(
        bitcoin.crypto.hash160(redeemScript)
      );

      const address = bitcoin.address.fromOutputScript(scriptPubKey);
      console.log(`BTC segwit address of ${program.holder}:`, address);

      storage.init().then(async () => {
        await storage.setItem(`${program.holder}.priv`, keyPair.toWIF());
        await storage.setItem(`${program.holder}addr`, address);
      });
    } else if (action === "generate-bch") {
      if (program.holder == undefined) {
        return console.log("Error: need -h flag, i.e. holder name");
      }

      bch.Networks.defaultNetwork = bch.Networks.testnet;

      const privateKey = new bch.PrivateKey();
      const address = privateKey.toAddress().toString();

      console.log(`BCH non segwit address of ${program.holder}:`, address);

      storage.init().then(async () => {
        await storage.setItem(`${program.holder}.priv`, privateKey.toString());
        await storage.setItem(`${program.holder}addr`, address);
      });
    } else if (action === "move-bch") {
      storage
        .init()
        .then(async () => {
          const to = await storage.getItem(`${program.address}`);
          const key = await storage.getItem(`${program.privateKey}`);

          if (key == undefined) {
            return console.log(
              "Error: Name for private key is incorrect, try this format <holder name>.priv"
            );
          }

          if (to == undefined) {
            return console.log(
              "Error: Name for address is incorrect, try this format <holder name>addr"
            );
          }

          bch.Networks.defaultNetwork = bch.Networks.testnet;

          const client = blocktrail.BlocktrailSDK({
            apiKey: "17724414556b43705ad3a469a8faeb300b783c9a",
            apiSecret: "6d15eacbdcbe3ea9b6ab98f8297c6043d975c93e",
            network: "BCC",
            testnet: true
          });

          const privateKey = new bch.PrivateKey(key);
          const address = privateKey.toAddress().toString();

          client
            .addressUnspentOutputs(address)
            .then(async (res, error) => {
              if (error) return console.log(error);
              if (res.data.length == 0) {
                return console.log(
                  `Error: no utxo to spend in address: ${address}`
                );
              }

              const tx = res.data[0];

              utxo = {
                txId: tx.hash,
                outputIndex: 0,
                address,
                script: tx.script_hex,
                satoshis: tx.value
              };

              const transaction = new bch.Transaction()
                .from(utxo)
                .to(to, tx.value - 1000)
                .fee(1000)
                .sign(privateKey);

              client.sendRawTransaction(
                transaction.toString(),
                (error, hash) => {
                  if (error) console.log(error);
                  console.log("tx:", hash);
                }
              );
            })
            .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
    } else
      return console.log(
        "Error: Action not defined \n choose one among:\n 1. generate-segwit \n 2. generate-bch \n 3. move-bch"
      );
  })
  .parse(process.argv);
