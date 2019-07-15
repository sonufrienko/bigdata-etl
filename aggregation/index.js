const { PubSub } = require("@google-cloud/pubsub");

const pubsub = new PubSub();
const TOPIC_SAVED = "data-saved";
const TOPIC_FINAL = "data-final";
const SUBSCRIPTION_NAME = 'aggregation';
const files = new Map();

const subscription = pubsub.topic(TOPIC_SAVED).subscription(SUBSCRIPTION_NAME);

// Create an event handler to handle messages
const messageHandler = message => {
  const { id, data, attributes } = message;
  const messageData = Buffer.from(data, "base64").toString();
  const messageObj = JSON.parse(messageData);
  const {
    file,
    count,
    index,
  } = messageObj;
  
  if (!files.has(file)) {
    files.set(file, new Set());
  }

  files.get(file).add(Number(index));
  
  message.ack();

  if (files.get(file).size === Number(count)) {
      // we collected all chunks
      const finalMessageData = {
        file,
        count
      };

      pubsub.topic(TOPIC_FINAL).publish(Buffer.from(JSON.stringify(finalMessageData))).then(() => {
        console.log(`Collected file: ${file}, count: ${count}.`);
        files.delete(file);
      });
  }
};

// Listen for new messages
subscription.on(`message`, messageHandler);