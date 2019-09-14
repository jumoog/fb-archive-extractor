const fs = require('fs');
const path = require('path');
const piexif = require("piexifjs");
const moment = require('moment');

// change your name
const yourName = "Kilian Kilian";

fs.readFile(__dirname + "/message_1.json", 'utf8', function (err, data) {
    let ob = JSON.parse(data);
    ob.messages.forEach(element => {
        // ignore messages from yourself
        if (element.sender_name !== yourName) {
            if (element.hasOwnProperty('photos')) {
                console.log(element.photos[0].uri);
                // only jpeg has EXIF
                if (path.extname(element.photos[0].uri) === ".jpg") {
                    let filename1 = element.photos[0].uri;
                    let filename2 = 'photo/' + path.basename(element.photos[0].uri);
                    let jpeg = fs.readFileSync(filename1);
                    let data = jpeg.toString("binary");
                    let exif = {};

                    // convert unix timestamp into EXIF Timestamp 
                    // 1558270587 -> 2019:05:19 14:56:27
                    exif[piexif.ExifIFD.DateTimeOriginal] = moment.unix(element.photos[0].creation_timestamp).format("YYYY:MM:DD HH:mm:ss");
                    let exifObj = {
                        "Exif": exif
                    };
                    let exifbytes = piexif.dump(exifObj);
                    let newData = piexif.insert(exifbytes, data);
                    let newJpeg = Buffer.from(newData, "binary");
                    fs.writeFileSync(filename2, newJpeg);
                }
            } else if (element.hasOwnProperty('videos')) {
                let filename1 = element.videos[0].uri;
                let filename2 = 'vid/' + path.basename(element.videos[0].uri);
                fs.copyFile(filename1, filename2, (err) => {
                    if (err) throw err;
                    console.log(`${path.basename(element.videos[0].uri)} was copied`);
                });
            }
        }
    });
});