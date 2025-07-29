export const imgFromb64 = (b64: string) => {
    const img = new Image();
    img.style.zIndex = "5";
    img.src = `data:image/png;base64,${b64}`;
    return img;
};
