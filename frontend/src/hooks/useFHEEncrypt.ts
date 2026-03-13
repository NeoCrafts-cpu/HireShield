import { useCofheEncrypt, useCofheConnection } from "@cofhe/react";
import { Encryptable } from "@cofhe/sdk";

type FHEType = "euint128" | "euint32" | "euint64" | "ebool";

export function useFHEEncrypt() {
  const { encryptInputsAsync, isEncrypting } = useCofheEncrypt();
  const connection = useCofheConnection();

  const isFheReady = connection.connected && !!connection.account && !!connection.chainId;

  const encrypt = async (value: bigint, type: FHEType) => {
    const item =
      type === "euint128" ? Encryptable.uint128(value) :
      type === "euint64" ? Encryptable.uint64(value) :
      type === "euint32" ? Encryptable.uint32(value) :
      Encryptable.bool(value !== 0n);

    const result = await encryptInputsAsync([item]);
    return result[0];
  };

  return { encrypt, isEncrypting, isFheReady, connection };
}
