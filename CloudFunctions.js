export const cloudFileUpload = async (storage, bucketName, localPath, destFileName) => {
    return await storage.bucket(bucketName).upload(localPath, {destination: destFileName})
}