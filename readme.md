# S3 Bucket POC

UPLOAD FILE: 

    node index.js
    node index.js --op=up    

Upload is default operation, if not explicitly defined.

    --private

Set upload file ACL to private

DELETE ALL FILES:

Remove all files mentioned in upload_urls.

    node index.js --op=del

GENEREATE PRESIGNED URLS:

Generate presigned urls for all files in upload_urls

save presigned urls in new file presigned_urls

    node index.js --op=psu