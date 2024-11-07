import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
// import "@syncfusion/ej2-base/styles/material.css";
// import "@syncfusion/ej2-react-schedule/styles/material.css";

import { BrowserRouter } from "react-router-dom";
import { registerLicense } from "@syncfusion/ej2-base";
registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpQnxbf1x0ZFxMYVlbRXFPMyBoS35RckRiWXheeXVQQmJVUEV0"
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
