const imageUpload = async (base64) => {
  const AWS = require("aws-sdk");
  const uuid = require("uuid").v4;

  const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = {
    ACCESS_KEY_ID: "AKIAY7SN6HWXWZNVQG6P",
    SECRET_ACCESS_KEY: "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",
    AWS_REGION: "us-east-2",
    S3_BUCKET: "test323hxshs",
  };

  AWS.config.setPromisesDependency(require("bluebird"));
  AWS.config.update({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: AWS_REGION,
  });

  const s3 = new AWS.S3();

  const base64Data = new Buffer.from(
    base64.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const type = base64.split(";")[0].split("/")[1];

  const userId = uuid();

  const params = {
    Bucket: S3_BUCKET,
    Key: `${userId}.${type}`, // type is not required
    Body: base64Data,
    ACL: "public-read",
    ContentEncoding: "base64", // required
    ContentType: `image/${type}`, // required. Notice the back ticks
  };

  try {
    const { Location } = await s3.upload(params).promise();
    return Location;
  } catch (error) {
    console.log(error);
  }
};

export { imageUpload };
