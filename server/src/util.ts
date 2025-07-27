export const bufferTob64 = (u8Array: Buffer) => {
    let b = "";
    const len = u8Array.length;
    for (let i = 0; i < len; i++) {
        b += String.fromCharCode(u8Array[i]);
    }
    return btoa(b);
}