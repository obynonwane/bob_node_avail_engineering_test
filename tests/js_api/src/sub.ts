import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import axios from "axios";
import type {
  EventRecord,
  ExtrinsicStatus,
  H256,
} from "@polkadot/types/interfaces";
import type {
  ISubmittableResult,
  SignatureOptions,
} from "@polkadot/types/types";
import config from "./config";
import { createApi } from "./api";

type CreateUserResponse = {
  name: string;
  job: string;
  id: string;
  createdAt: string;
};

const keyring = new Keyring({ type: "sr25519" });

async function main() {
  const api = await createApi();
  const chain = await api.rpc.system.chain();
  console.log("connected to chain: " + chain.toString());
  const metadata = await api.rpc.state.getMetadata();
  let rep = config.count;
  let count = 0;
  // Subscribe to the new headers
  const unsubHeads = await api.rpc.chain.subscribeNewHeads(
    async (lastHeader) => {
      console.log(
        `${chain}: last block #${lastHeader.number} has hash ${lastHeader.hash}`
      );
      //send subscription to my local node server
      await retrieveSubscription(lastHeader);
      if (++count === rep && rep !== undefined) {
        unsubHeads();
        process.exit(0);
      }
    }
  );
}

async function retrieveSubscription(lastHeader: any) {
  try {
    // 👇️ const data: CreateUserResponse
    const { data } = await axios.post(
      "http://localhost:5000/api/v1/base/bob",
      lastHeader,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error message: ", error.message);
      // 👇️ error: AxiosError<any, any>
      return error.message;
    } else {
      console.log("unexpected error: ", error);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
