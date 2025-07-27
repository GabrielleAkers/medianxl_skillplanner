interface MedianManifestFileEntry {
    name: string,
    url: string,
    md5: string,
    sha1: string,
    size: number
}

export default interface MedianManifest {
    tag: string,
    location: string,
    channel: string,
    files: MedianManifestFileEntry[]
}