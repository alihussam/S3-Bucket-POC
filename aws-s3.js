const AWS = require('aws-sdk');

const config = {
  BUCKET_NAME: process.env.BUCKET_NAME,
  USER_KEY: process.env.USER_KEY,
  USER_SECRET: process.env.USER_SECRET,
  signedUrlExpireSeconds: 60,
}

AWS.config.update({ accessKeyId: config.USER_KEY, secretAccessKey: config.USER_SECRET });
const s3 = new AWS.S3()

const upload = async (data, mimeType, id, isPrivate) => {
  try {
    let access_level = isPrivate == true ? "private" : "public-read";
    console.log('ACL: ', access_level);
    if (!id) throw new Error("Object Id Undefined");
    const params = {
      ACL: access_level,
      Body: data,
      ContentType: mimeType,
      Bucket: config.BUCKET_NAME,
      Key: `digitest/${id}/${new Date().getTime()}`,
    };
    let result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    throw error
  }
}

const deleteFiles = async (keys) => {
  try {
    const params = {
      Bucket: config.BUCKET_NAME,
      Delete: {
        Objects: keys
      }
    };
    return await s3.deleteObjects(params).promise();
  } catch (error) {
    throw error
  }
}

const presignedGetUrl = async (key) => {
  try {
    let presignedUrl = await s3.getSignedUrl('getObject', {
      Bucket: config.BUCKET_NAME,
      Key: key,
      Expires: config.signedUrlExpireSeconds
    });
    return presignedUrl;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  upload,
  deleteFiles,
  presignedGetUrl,
}