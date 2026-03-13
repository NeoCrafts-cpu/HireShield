import { useCofheEncrypt, useCofheConnection } from "@cofhe/react";
import { Encryptable } from "@cofhe/sdk";

type FHEType = "euint128" | "euint32" | "euint64" | "ebool";

function toEncryptable(value: bigint, type: FHEType) {
  return type === "euint128" ? Encryptable.uint128(value)
    : type === "euint64" ? Encryptable.uint64(value)
    : type === "euint32" ? Encryptable.uint32(value)
    : Encryptable.bool(value !== 0n);
}

export function useFHEEncrypt() {
  const { encryptInputsAsync, isEncrypting } = useCofheEncrypt();
  const connection = useCofheConnection();

  const isFheReady = connection.connected && !!connection.account && !!connection.chainId;

  /** Encrypt a single value */
  const encrypt = async (value: bigint, type: FHEType) => {
    const result = await encryptInputsAsync([toEncryptable(value, type)]);
    return result[0];
  };

  /** Encrypt multiple values in a single batch (much faster than sequential) */
  const encryptBatch = async (items: Array<{ value: bigint; type: FHEType }>) => {
    const encryptables = items.map((i) => toEncryptable(i.value, i.type));
    return encryptInputsAsync(encryptables);
  };

  return { encrypt, encryptBatch, isEncrypting, isFheReady, connection };
}
