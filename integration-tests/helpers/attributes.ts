import {getCurrentPlatform} from "./platform";

const platform = getCurrentPlatform();
const ATTRIBUTES_BY_PLATFORM = {
  android: {
    session_id: "session.id",
  },
  iOS: {
    session_id: "emb.session_id",
  },
};

const getAttributesNameByCurrentPlatform = () => {
  return ATTRIBUTES_BY_PLATFORM[platform];
};

export {getAttributesNameByCurrentPlatform};
