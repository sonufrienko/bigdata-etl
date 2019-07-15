const { Datastore } = require("@google-cloud/datastore");
const { PubSub } = require("@google-cloud/pubsub");
const { processData } = require("./build/Release/addon");

const datastore = new Datastore();
const pubsub = new PubSub();
const TOPIC_NAME = "data-saved";

const writeToDatabase = async ({ data, file, count, index, length }) => {
  const kind = "data";
  const key = datastore.key(kind);
  const entity = {
    key,
    excludeFromIndexes: ['data', 'length'],
    data: {
      data,
      file,
      count, 
      index,
      length
    }
  };

  await datastore.save(entity);
};

exports.pubSubConsumer = async (event, context) => {
  const {
    data,
    attributes: { file, count, index }
  } = event;
  
  const dataString = Buffer.from(data, "base64").toString().slice(0,  1000000);

  const eventData = {
    file,
    count,
    index,
  };
  
  /**
   * Run "processData" function from C++ code
   */
  const length = processData(dataString);

  await writeToDatabase({ data: dataString, file, count, index, length });
  await pubsub.topic(TOPIC_NAME).publish(Buffer.from(JSON.stringify(eventData)));
};