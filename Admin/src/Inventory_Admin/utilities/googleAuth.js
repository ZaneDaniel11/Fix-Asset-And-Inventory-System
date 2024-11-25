import { gapi } from "gapi-script";

const initGoogleAPI = (clientId) => {
  gapi.load("client:auth2", () => {
    gapi.client.init({
      clientId: clientId,
      scope: "https://www.googleapis.com/auth/gmail.send",
    });
  });
};

export default initGoogleAPI;
