import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import mkdirp from 'mkdirp';
import unzipper from 'unzipper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const BucketFOUO = process.env.AWS_FOUO_BUCKET_NAME;
const Bucket = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_REGION;

const files = ['SimCommandCAA-latest.csv'];

AWS.config.update({
    region: bucketRegion,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const s3 = new AWS.S3();

const getPreviousDayZip = async (day) => {
    const Key = `${day}.zip`;
    try {
        const fileStream = await s3
            .getObject({ Key, Bucket })
            .createReadStream()
            .pipe(unzipper.Extract({ path: 'files' }));
        const writeStream = await fs.createWriteStream(path.join(__dirname, '..', Key));
        await fileStream.pipe(writeStream);
        return 'success';
    } catch (e) {
        console.log(`ERROR CAUGHT: ${e}`);
        return 'error';
    }
};

mkdirp.sync('files');

const fetchFiles = async () => {
    const fetchZip = async () => {
        let done = false;
        let dayToFetch = dayjs();
        // eslint-disable-next-line consistent-return
        const fileName = await (async () => {
            while (!done) {
                dayToFetch = dayToFetch.subtract(1, 'day');
                // eslint-disable-next-line no-await-in-loop
                const response = await getPreviousDayZip(dayToFetch.format('M-D'));
                if (response === 'success') {
                    done = true;
                    return `${dayToFetch.format('M-D')}.zip`;
                }
            }
        })();
        return fileName;
    };

    await fetchZip();
    // .then((fileName) => {
    //     fs.createReadStream(fileName).pipe(unzipper.Extract({ path: path.join(__dirname, '..', 'data/') }));
    // });
    console.log('finished fetching zip');
    // FOUO File fetching
    files.forEach(async (Key) => {
        const fileStream = await s3.getObject({ Key, Bucket: BucketFOUO }).createReadStream();
        const writeStream = await fs.createWriteStream(path.join(__dirname, '..', 'files', Key));
        return fileStream.pipe(writeStream);
    });
    console.log('finished fetching FOUO files');
};

fetchFiles();
