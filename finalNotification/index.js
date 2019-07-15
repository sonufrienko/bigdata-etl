const { Datastore } = require("@google-cloud/datastore");

const datastore = new Datastore();

const readFileFromDatabase = ({ file }) => {  
  const kind = "data";
  const query = datastore
    .createQuery(kind)
    .filter('file', '=', file);

  return datastore.runQuery(query);
};

exports.finalNotification = async (event, context) => {
  const { data } = event;
  const dataStr = Buffer.from(data, "base64").toString();
  console.log(dataStr);
  
  const dataObj = JSON.parse(dataStr);
  const { file, count } = dataObj;
  
  const a = process.hrtime();
  const [rows] = await readFileFromDatabase({ file });
  const b = process.hrtime(a);
  
  console.log(`${file}, rows: ${rows.length}, time: ${b[0]} s ${(b[1]/1e6).toFixed(4)} ms.`);
};