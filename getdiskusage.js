const fs = require('fs');

function walkSync(dir, filelist) {
  try {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
      let currentPath = dir + '/' + file;
      if (fs.statSync(currentPath).isDirectory()) {
        filelist = walkSync(currentPath, filelist);
      }
      else {
        const fileSize = fs.statSync(currentPath).size
        let obj = {
          [currentPath]: fileSize
        }
        filelist.push(obj);
      }
    });
    return filelist;
  } catch (e) {
    return "Please try again. Make sure the mount point is a valid directory and you have read permission on it"
  }
};

let cmdArg = (process.argv).splice(2, 1);

if (cmdArg.length !== 1) {
  console.log("Invalid input");
} else {
  console.log(walkSync(cmdArg[0]));
}