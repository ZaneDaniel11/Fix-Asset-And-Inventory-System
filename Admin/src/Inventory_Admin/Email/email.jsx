import React, { useEffect } from "react";
import { gapi } from "gapi-script";
import { Base64 } from "js-base64";

const clientId =
  "610281932200-id85fq3o0pjj4lobvtttpgauu86jvm3d.apps.googleusercontent.com";

const EmailSender = () => {
  useEffect(() => {
    const initClient = async () => {
      try {
        await new Promise((resolve) => gapi.load("client:auth2", resolve));
        await gapi.client.init({
          clientId: clientId,
          scope: "https://www.googleapis.com/auth/gmail.send",
        });
        console.log("Google API client initialized.");
      } catch (error) {
        console.error("Error initializing Google API client:", error);
      }
    };
    initClient();
  }, []);

  const handleLogin = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      const accessToken = user.getAuthResponse().access_token;
      console.log("Access Token:", accessToken);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleSendEmail = async () => {
    const rawEmail = `
  To: kramnotado22@gmail.com
  Subject: Test Email from React
  Content-Type: text/plain; charset="UTF-8"
  
  This is a test email sent using Gmail API in React.
    `;

    const base64EncodedEmail = Base64.encodeURI(rawEmail);

    try {
      const response = await gapi.client.gmail.users.messages.send({
        userId: "me",
        resource: {
          raw: base64EncodedEmail,
        },
      });
      console.log("Email sent successfully:", response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };
  return (
    <div>
      <h2>Email Sender</h2>
      <button onClick={handleLogin}>Login with Google</button>
      <button onClick={handleSendEmail}>Send Email</button>
    </div>
  );
};

export default EmailSender;
