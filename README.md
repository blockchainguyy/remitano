# Remitano test task documentation
This is a guide to help you run the test tasks given by Remitano!

The script provided can be used to accomplish the following three tasks:

1. Generate a Segwit BTC address.
2. Generate a BCH address
3. Send transactions from BCH addresses generated using our script to other BCH addresses or BTC addresses including Segwit BTC addresses.

## Installation
Here we will be assuming that you have node and npm pre installed in your computer. We used node v8.9.3 and npm v5.6.0 during development.

If you have a zip file extract it and go to project directory in your terminal

```
cd path/to/project
```

Then run the following command so that all the required dependencies are installed in your system:

```
npm install -g
```

## Usage
The above steps will also install the required `blockchain` cli snippet for your terminal. Three kind of actions can be appended to this cli tool to generate required results. They're:

* generate-segwit
* generate-bch
* move-bch

To know about other options used by the cli tool, you can use the following command:

```
blockchain --help
```
Although they will be explained in detail here. If you type anything other than the action codes provided above it will return the following error:

```
Error: Action not defined
 choose one among:
 1. generate-segwit
 2. generate-bch
 3. move-bch
```

Now we will go through the actions and there usage one by one:

### generate-segwit

To use this action it is necessary to use the `-h` flag, it will be used to specify the name of holder for the address and private key generated. If you want to save the address generated in `Aaddr` and private key in `A.priv` then the holder supplied with `-h` flag will be `A`. The command will be as follows:

```
blockchain generate-segwit -h A
// BTC segwit address of A: 39hgC4Tq5vhPypNSPRDLuh5z8MWbTP4MqY
```

Please note that if you re-run this command it will overwrite previously generated variable. This command will generate a Segwit BTC address of P2SH type and will save it to `Aaddr` and will log it. It will also generate a private key and will save it to `A.priv`.

Any other options found in `--help` will not be usable here.

### generate-bch

To use this action too, the `-h` flag will be necessary, it will be used to specify the name of holder for the address and private key generated. If you want to save the address generated in `Baddr` and private key in `B.priv` then the holder supplied with `-h` flag will be `B`. The command will be as follows:

```
blockchain generate-bch -h B
// BCH non segwit address of B: n1sgFvgMnFFXqadYRQcEEb3AdxtyHFXZZ7
```

Please note that if you re-run this command it will overwrite previously generated variable. This command will generate a non segwit BCH address and will save it to `Baddr` and will log it. It will also generate a private key and will save it to `B.priv`.

Any other options found in `--help` will not be usable here.

### move-bch

This action can be used to transfer existing UTXOs in BCH addresses generated using our cli tool to other addresses generated in our cli tool. To use it you need to specify two flags, `-p` and `-a`. `-p` will be used to specify the name of private key of the address who will be sending the UTXO. `-a` will be used to specify the recieving address. Remember the sender must have UTXOs to spend. Suppose `B` is the BCH address being used to send the transaction and `A` will be the address recieving the transaction. Then the command will be as follows:

```
blockchain move-bch -p B.priv -a Aaddr
// tx: { hash: 'cd9177402a0c7deb3b3ce59d8cde8836eb3d464e61dc00b3f6f31fd14cf1063a' }
```

It will log the transaction hash of the broadcasted transaction. This command will spend the last UTXO sent to the sending address and send it the recieving address with a deduction of 1000 satoshi. Please note that it cannot be used to spend UTXOs on address generated through `generate-segwit` action, and the sender can only be a BCH address generated using `move-bch` script.

`-h` option will not be usable here.
