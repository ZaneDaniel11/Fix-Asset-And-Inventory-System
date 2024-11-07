import React from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  Month,
  Agenda,
  Inject,
  ViewsDirective,
  ViewDirective,
} from "@syncfusion/ej2-react-schedule";

// Sample event data
const events = [
  {
    Id: 1,
    Subject: "Team Meeting",
    StartTime: new Date(2024, 10, 8, 10, 0),
    EndTime: new Date(2024, 10, 8, 11, 0),
    Location: "Conference Room 1",
  },
  {
    Id: 2,
    Subject: "Client Presentation",
    StartTime: new Date(2024, 10, 9, 14, 0),
    EndTime: new Date(2024, 10, 9, 15, 30),
    Location: "Online",
  },
];

export default function Schedule() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Schedule Component */}

      <ScheduleComponent eventSettings={{ dataSource: events }}>
        <ViewsDirective>
          <ViewDirective option="Day" />
          <ViewDirective option="Week" />
          <ViewDirective option="Month" />
          <ViewDirective option="Agenda" />
        </ViewsDirective>
        <Inject services={[Day, Week, Month, Agenda]} />
      </ScheduleComponent>
    </div>
  );
}
