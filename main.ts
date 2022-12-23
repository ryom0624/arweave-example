import "dotenv/config";
import * as fs from "fs";
import axios from "axios";
import { Wallet, ethers } from "ethers";
import Bundlr from "@bundlr-network/client";

const main = async () => {
  const sleep = (second: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, second * 1000));

  const privKey = process.env.PRIVKEY ?? "";
  const alchemyProviderApiKey = process.env.ALCHEMY_API_KEY ?? "";

  const wallet = new Wallet(privKey);
  const provider = new ethers.providers.AlchemyProvider("goerli", alchemyProviderApiKey);

  /* from arweave wallet */
  // const jwk = JSON.parse(fs.readFileSync("wallet.json").toString());
  // const bundlr = new Bundlr("http://node1.bundlr.network", "arweave", jwk);

  /* mainnet */
  // const bundlr = new Bundlr("http://node1.bundlr.network", "ethereum", "<privkey>");

  /* testnet(goerli) */
  const bundlr = new Bundlr("https://devnet.bundlr.network", "ethereum", privKey, {
    providerUrl: "https://eth-goerli.g.alchemy.com/v2/" + alchemyProviderApiKey,
  });

  await bundlr.ready();
  console.log("address: ", bundlr.address);

  let price;
  let balance;

  console.log("ether balance:", ethers.utils.formatEther((await provider.getBalance(wallet.address)).toString()), "ETH");

  /* n バイトあたりの読み込んだ通貨で価格を計算 */
  const bytes = 1024;
  price = await bundlr.getPrice(bytes);
  console.log(`price per ${bytes} bytes: ${bundlr.utils.unitConverter(price).toFixed(10)}`);

  /* 残高表示 */
  balance = await bundlr.getLoadedBalance();
  console.log("fund balance: ", bundlr.utils.unitConverter(balance).toFixed(10));

  /* 基金にある価格が不足している場合 */
  if (balance.isLessThan(price)) {
    const diff = price.minus(balance);
    console.log(`add funds ${bundlr.utils.unitConverter(diff).toFixed(10)}`);
    /* 基金への預け入れ */
    let response = await bundlr.fund(diff);
    console.log("  -------------  ");
    console.log(response);
    console.log("  -------------  ");

    while (true) {
      balance = await bundlr.getLoadedBalance();
      if (balance.isGreaterThanOrEqualTo(price)) {
        break;
      }
      console.log(
        `do not relfect balance. balance: ${bundlr.utils.unitConverter(balance).toFixed(10)}, price: ${bundlr.utils.unitConverter(price).toFixed(10)}`
      );
      sleep(15);
    }

    console.log("funds added: ", ethers.utils.formatEther((await provider.getBalance(wallet.address)).toString()));
  } else {
    console.log("enough fund");
  }

  /* uploadFile */
  const res = await bundlr.uploadFile("./pepe.jpeg");
  console.log(res);

  /* upload data */
  // const data = fs.readFileSync("data.txt");
  // const tags = [{ name: "Content-Type", value: "application/json" }];

  // const res = await bundlr.upload(data, { tags: tags });
  // console.log(res);
  // console.log("id", res.id);
  // console.log(`Uploaded to https://arweave.net/${res.id}`);

  /* sendTransaction */
  // const transaction = bundlr.createTransaction(data, { tags: tags });
  // await transaction.sign();
  // await transaction.upload();
  // console.log(transaction.id);

  /* 残高表示 */
  // balance = await bundlr.getLoadedBalance();
  // console.log(bundlr.utils.unitConverter(balance).toFixed(10));

  /* check */
  // const resp = await axios.get(`https://arweave.net/${res.id}`);
  // if (resp.status !== 200) {
  //   throw new Error("ERROR: " + resp.data);
  // }
  // console.log(resp.data);

  balance = await bundlr.getLoadedBalance();
  console.log("left balance", bundlr.utils.unitConverter(balance).toFixed(10));

  /* 引き出し */
  // await bundlr.withdrawBalance(balance);
};

main().catch((e) => {
  console.error(e);
});
