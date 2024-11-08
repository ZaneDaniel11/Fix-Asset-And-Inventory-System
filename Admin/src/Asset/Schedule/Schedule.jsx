import React, { useEffect, useState } from "react";
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

const API_URL = "http://localhost:5075/api/SchedulerEvents";

export default function Schedule() {
  const [events, setEvents] = useState([]);

  // Load events from the backend API
  const loadEvents = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Raw API Data:", data); // Log raw data for inspection

      // Map the fields correctly based on the API response
      const formattedEvents = Array.isArray(data)
        ? data.map((event) => ({
            Id: event.eventID, // 'eventID' in API response
            Subject: event.title, // 'title' in API response
            StartTime: new Date(event.startTime), // Parse 'startTime' as Date
            EndTime: new Date(event.endTime), // Parse 'endTime' as Date
            IsAllDay: event.isAllDay, // 'isAllDay' in API response
            Description: event.description || "", // Fallback if description is empty
            Location: event.location || "", // Fallback for location
            RecurrenceRule: event.recurrenceRule || null, // 'recurrenceRule' in API response
            CreatedBy: event.createdBy, // 'createdBy' in API response
            CreatedDate: new Date(event.createdDate), // Parse 'createdDate' as Date
            LastModified: new Date(event.lastModified), // Parse 'lastModified' as Date
          }))
        : []; // Default to empty array if response is not an array

      console.log("Formatted events:", formattedEvents);
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Failed to load events", error);
    }
  };

  // Fetch events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {events.length === 0 ? (
        <p>Loading events...</p> // Show a loading message while events are being fetched
      ) : (
        <ScheduleComponent
          eventSettings={{ dataSource: events }} // Use the formatted events from the API
          actionBegin={(args) => {
            if (args.requestType === "eventCreate") {
              onEventAdd(args);
            } else if (args.requestType === "eventChange") {
              onEventUpdate(args);
            } else if (args.requestType === "eventRemove") {
              onEventDelete(args);
            }
          }}
        >
          <ViewsDirective>
            <ViewDirective option="Day" />
            <ViewDirective option="Week" />
            <ViewDirective option="Month" />
            <ViewDirective option="Agenda" />
          </ViewsDirective>
          <Inject services={[Day, Week, Month, Agenda]} />
        </ScheduleComponent>
      )}
    </div>
  );
}
