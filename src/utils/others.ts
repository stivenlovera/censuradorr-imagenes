export function blobToFile(theBlob, fileName, fileType) {
  return new File([theBlob], fileName, {
    type: fileType || theBlob.type,
    lastModified: Date.now() // Use the current time as last modified date
  });
}