class Nat {
  private value: number[];

  constructor(value: number[]) {
      this.value = value;
  }

  toBytes(): number[] {
      return this.value;
  }

  toString(): string {
      let result = "";
      let carry = 0;
      const digits: number[] = [];

      for (let i = this.value.length - 1; i >= 0; i--) {
          carry = (carry << 8) | this.value[i];
          digits.push(carry % 10);
          carry = Math.floor(carry / 10);
      }

      while (carry > 0) {
          digits.push(carry % 10);
          carry = Math.floor(carry / 10);
      }

      if (digits.length === 0) {
          digits.push(0);
      }

      for (let i = digits.length - 1; i >= 0; i--) {
          result += digits[i].toString();
      }

      return result;
  }

  // Add this new method
  toBigInt(): bigint {
      return BigInt(this.toString());
  }
}

// Modify the arweaveIdToNat function to return a bigint
export function arweaveIdToNat(arweaveId: string): bigint {
  let id = arweaveId.slice(0, 43);
  while (id.length % 4 !== 0) {
      id += '=';
  }
  id = id.replace(/-/g, '+').replace(/_/g, '/');

  return new Nat(base64Decode(id)).toBigInt();
}

export function natToArweaveId(num: Nat): string {
  let id = base64Encode(num.toBytes());
  id = id.replace(/\+/g, '-').replace(/\//g, '_');
  return id.replace(/=/g, '');
}

function base64Decode(input: string): number[] {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const result: number[] = [];
  let bits = 0;
  let bitsLength = 0;

  for (let i = 0; i < input.length; i++) {
      if (input[i] === '=') break;
      bits = (bits << 6) | base64Chars.indexOf(input[i]);
      bitsLength += 6;

      if (bitsLength >= 8) {
          bitsLength -= 8;
          result.push((bits >>> bitsLength) & 0xFF);
      }
  }

  return result;
}

function base64Encode(input: number[]): string {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  while (i < input.length) {
      const b1 = input[i++];
      const b2 = i < input.length ? input[i++] : 0;
      const b3 = i < input.length ? input[i++] : 0;

      const triplet = (b1 << 16) | (b2 << 8) | b3;

      result += base64Chars[(triplet >>> 18) & 0x3F];
      result += base64Chars[(triplet >>> 12) & 0x3F];
      result += base64Chars[(triplet >>> 6) & 0x3F];
      result += base64Chars[triplet & 0x3F];
  }

  const padding = 3 - (input.length % 3);
  if (padding === 1) {
      result = result.slice(0, -1);
  } else if (padding === 2) {
      result = result.slice(0, -2);
  }

  return result;
}
