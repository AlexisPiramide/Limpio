import {
    S3Client,
    ListObjectsCommand,
    PutObjectCommand
  } from "@aws-sdk/client-s3";
import { aws_access_key_id,aws_secret_access_key,aws_session_token } from "../constantes";
const s3Client = new S3Client({
    region:"us-east-1",
    credentials:{
      accessKeyId:aws_access_key_id,
      secretAccessKey:aws_secret_access_key,
      sessionToken:aws_session_token
    }
  });

export const listFilesInBucket = async () => {
    //De momento pongo el bucket a mano
    const command = new ListObjectsCommand({ Bucket: "barrabesafull" });
    const { Contents } = await s3Client.send(command);
    const contentsList = Contents ? Contents.map((c) => ` • ${c.Key}`).join("\n") : "No contents found";
    console.log("\nHere's a list of files in the bucket:");
    console.log(`${contentsList}\n`)
    console.log(Contents);
    return Contents;
};

export const uploadFileToBucket = async (file) => {
    console.log(file);
    const response =await s3Client.send(
      new PutObjectCommand({
        Bucket: "barrabesafull",
        Body: file,
        Key: file.name,
        ContentType:file.type
      }),
    );
    console.log(response);
};