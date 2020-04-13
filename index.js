const imageData = require('./image');
const AWS = require('./aws-s3');
const fs = require('fs');
const argv = require('yargs').default('op', 'up').argv;
const util = require('util');

const readFile = util.promisify(fs.readFile);

const uploadImage = async (isPrivate) => {
    try {
        console.log('UPLOADING FILE :');
        let imageUrl = await AWS.upload(imageData, 'image/png', 'ppoc', isPrivate);
        fs.appendFile('upload_urls', imageUrl + ` :: isPrivate=${isPrivate}\n`, (err) => console.assert(!err, `Url not appended in file. ${err}`));
        console.log('Image upload success at: ', imageUrl);
    } catch (error) {
        console.error(error);
    }
}

const deleteAllCreated = async () => {
    try {
        console.log('DELETING ALL FILES IN upload_urls :');
        let data = await readFile('upload_urls', 'utf-8');
        let urls = data.split('\n');
        let keys = [];
        for (let index in urls) {
            if (urls[index].trim().length == 0) continue;
            let url = urls[index].split(" ::")[0];
            let key = url.split('amazonaws.com/')[1];
            keys.push({ Key: key });
        }
        if (keys.length > 0) console.log(await AWS.deleteFiles(keys));
        // remove all urls from upload_urls
        fs.writeFile('upload_urls', '', err => console.assert(!err, `Error deleting urls from upload_urls, ${err}`));
    }
    catch (err) {
        console.error('Error: ', err);
    }
}

const getPresignedUrl = async () => {
    try {
        console.log('PRESIGNED GET URL: ');
        let data = await readFile('upload_urls', 'utf-8');
        let urls = data.split('\n');
        let presignedUrls = [];
        for (let index in urls) {
            if (urls[index].trim().length == 0) continue;
            let url = urls[index].split(" ::")[0];
            let key = url.split('amazonaws.com/')[1];
            presignedUrls.push(await AWS.presignedGetUrl(key)+"\n");
        }
        fs.writeFile('presigned_urls', presignedUrls, err => console.assert(!err, `Error creating presigned_url file, ${err}`));

    } catch (err) {
        console.error('Error: ', err);
    }
}

// evaluate args
switch (argv.op) {
    case 'up': // to upload file
        uploadImage(argv.private ? true : false);
        break;
    case 'del': // to delete all files
        deleteAllCreated();
        break;
    case 'psu':
        getPresignedUrl();
        break;
    default:
        console.error('Un-identified Operation');
}
