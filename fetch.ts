import axios from "axios";

const main = async () => {
  const url = "https://arweave.net/BxYJnuLzUDzKUOY_T0BUuFNdlJd2VsqqZ6gSv_n_U6s";
  const resp = await axios.get(url);
  if (resp.status !== 200) {
    throw new Error("ERROR: " + resp.data);
  }
  console.log(resp.data);
};

main().catch((e) => {
  console.error(e);
});
