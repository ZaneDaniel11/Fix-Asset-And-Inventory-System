import React, { useState, useEffect } from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
} from "@syncfusion/ej2-react-schedule";

// API URL base
const API_BASE_URL = "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/EventsApi";

// Fetch events from API
const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/GetEvents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return data.map((event) => ({
      Id: event.eventID,
      Subject: event.subject,
      StartTime: new Date(event.startTime),
      EndTime: new Date(event.endTime),
      IsAllDay: event.isAllDay,
      RecurrenceRule: event.recurrenceRule,
      Description: event.description, // Include description
      Location: event.location,
      Organizer: event.organizer,
      Color: event.color,
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// Add new event via API
const addEvent = async (eventData) => {
  try {
    console.log("Adding event:", eventData); // Log the event data to check structure
    const response = await fetch(
      "https://crmcpropertycusbacck-ffgphsd2aveqdxen.southeastasia-01.azurewebsites.net/api/EventsApi/AddEvent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      }
    );
    if (!response.ok) throw new Error(`Error adding event: ${response.status}`);
    const createdEvent = await response.json();
    console.log("Event added successfully:", createdEvent);
    return createdEvent;
  } catch (error) {
    console.error("Error adding event:", error);
  }
};

// Update an existing event via API
const updateEvent = async (eventData) => {
  try {
    console.log("Updating event:", eventData); // Log to verify structure
    const response = await fetch(
      `${API_BASE_URL}/UpdateEvent/${eventData.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventID: eventData.id, // Adjust to match backend naming
          subject: eventData.subject,
          description: eventData.description,
          startTime: eventData.startTime.toISOString(), // Convert to ISO string
          endTime: eventData.endTime.toISOString(),
          isAllDay: eventData.isAllDay,
          recurrenceRule: eventData.recurrenceRule || "", // Include default if null
          location: eventData.location,
          organizer: eventData.organizer,
          color: eventData.color,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error updating event: ${response.status} - ${errorText}`
      );
    }
    console.log("Event updated successfully");
  } catch (error) {
    console.error("Error updating event:", error);
  }
};

// Delete an event via API
const deleteEvent = async (id) => {
  try {
    console.log("Deleting event with ID:", id);
    const response = await fetch(`${API_BASE_URL}/DeleteEvent/${id}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error(`Error deleting event: ${response.status}`);
    console.log("Event deleted successfully");
  } catch (error) {
    console.error("Error deleting event:", error);
  }
};

export default function Schedule() {
  const [events, setEvents] = useState([]);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents().then(setEvents);
  }, []);

  // Handle CRUD actions
  const onActionBegin = async (args) => {
    if (args.requestType === "eventCreate") {
      const newEvent = {
        subject: args.data[0].Subject,
        description: args.data[0].Description || "No description",
        startTime: args.data[0].StartTime,
        endTime: args.data[0].EndTime,
        isAllDay: args.data[0].IsAllDay || false,
        recurrenceRule: args.data[0].RecurrenceRule || "",
        location: args.data[0].Location || "Unknown",
        organizer: args.data[0].Organizer || "Anonymous",
        color: args.data[0].Color || "#000000",
      };
      const createdEvent = await addEvent(newEvent);
      if (createdEvent) {
        setEvents(await fetchEvents());
      }
    } else if (args.requestType === "eventChange") {
      // Only update fields that were changed
      const updatedEvent = {
        id: args.data.Id,
        subject:
          args.data.Subject ||
          events.find((e) => e.Id === args.data.Id).Subject, // Use existing data if unchanged
        description:
          args.data.Description ||
          events.find((e) => e.Id === args.data.Id).Description,
        startTime: args.data.StartTime
          ? args.data.StartTime.toISOString()
          : events.find((e) => e.Id === args.data.Id).StartTime.toISOString(),
        endTime: args.data.EndTime
          ? args.data.EndTime.toISOString()
          : events.find((e) => e.Id === args.data.Id).EndTime.toISOString(),
        isAllDay:
          args.data.IsAllDay !== undefined
            ? args.data.IsAllDay
            : events.find((e) => e.Id === args.data.Id).IsAllDay,
        recurrenceRule:
          args.data.RecurrenceRule ||
          events.find((e) => e.Id === args.data.Id).RecurrenceRule,
        location:
          args.data.Location ||
          events.find((e) => e.Id === args.data.Id).Location,
        organizer:
          args.data.Organizer ||
          events.find((e) => e.Id === args.data.Id).Organizer,
        color:
          args.data.Color || events.find((e) => e.Id === args.data.Id).Color,
      };

      await updateEvent(updatedEvent);
      setEvents(await fetchEvents());
    } else if (args.requestType === "eventRemove") {
      await deleteEvent(args.data[0].Id);
      setEvents(await fetchEvents());
    }
  };

  return (
    <div className="flex justify-center py-10 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          My Schedule
        </h2>
        <div className="rounded-lg overflow-hidden">
          <ScheduleComponent
            height="650px"
            selectedDate={new Date()}
            eventSettings={{ dataSource: events }}
            currentView="Month"
            actionBegin={onActionBegin}
            showHeaderBar={true}
          >
            <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
          </ScheduleComponent>
        </div>
      </div>
    </div>
  );
}
