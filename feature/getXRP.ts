import { Client, Wallet } from "xrpl";
import { pay } from "./pay";
import { createWallet } from "./createWallet";


(async () => {
  const newWallet = await createWallet();
  const ReceiverAddr = "r4aeWS2sCXXjRupQGd9LmvPEN9M7xsDqQm";   
  
  if (newWallet.secret) {
    await pay(newWallet.secret, ReceiverAddr, 90);
  }
})();