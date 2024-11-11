import React from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
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

// Customize event colors based on subject
const onEventRendered = (args) => {
  if (args.data.Subject === "Team Meeting") {
    args.element.classList.add("bg-green-500", "text-white");
  } else if (args.data.Subject === "Client Presentation") {
    args.element.classList.add("bg-red-500", "text-white");
  }
};

export default function Schedule() {
  return (
    <div className="flex justify-center py-10 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          My Schedule
        </h2>
        <div className="rounded-lg overflow-hidden">
          <ScheduleComponent
            height="650px"
            selectedDate={new Date(2024, 10, 8)}
            eventSettings={{ dataSource: events }}
            currentView="Month"
            eventRendered={onEventRendered}
            showHeaderBar={true}
          >
            <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
          </ScheduleComponent>
        </div>
      </div>
    </div>
  );
}
