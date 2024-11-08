using Microsoft.AspNetCore.Mvc;
using Dapper;
using System.Data;
using System.Threading.Tasks;
using Backend.Models;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchedulerEventsController : ControllerBase
    {
         private readonly string _dbConnection = "Data Source=capstone.db";
     
        // Create Event
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] SchedulerEvent newEvent)
        {
            var sql = @"INSERT INTO SchedulerEvents (Title, Description, StartTime, EndTime, IsAllDay, RecurrenceRule, Location, CreatedBy, CreatedDate, LastModified)
                        VALUES (@Title, @Description, @StartTime, @EndTime, @IsAllDay, @RecurrenceRule, @Location, @CreatedBy, @CreatedDate, @LastModified);
                        SELECT LAST_INSERT_ROWID();";
            newEvent.CreatedDate = DateTime.Now;
            newEvent.LastModified = DateTime.Now;

            var eventId = await _dbConnection.ExecuteScalarAsync<int>(sql, newEvent);
            return Ok(new { EventID = eventId });
        }

        // Read All Events
        [HttpGet]
        public async Task<IActionResult> GetAllEvents()
        {
            var sql = "SELECT * FROM SchedulerEvents";
            var events = await _dbConnection.QueryAsync<SchedulerEvent>(sql);
            return Ok(events);
        }

        // Read Event by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventById(int id)
        {
            var sql = "SELECT * FROM SchedulerEvents WHERE EventID = @id";
            var eventItem = await _dbConnection.QueryFirstOrDefaultAsync<SchedulerEvent>(sql, new { id });

            if (eventItem == null)
                return NotFound("Event not found");

            return Ok(eventItem);
        }

        // Update Event
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] SchedulerEvent updatedEvent)
        {
            var sql = @"UPDATE SchedulerEvents 
                        SET Title = @Title, Description = @Description, StartTime = @StartTime, EndTime = @EndTime, 
                            IsAllDay = @IsAllDay, RecurrenceRule = @RecurrenceRule, Location = @Location, 
                            LastModified = @LastModified
                        WHERE EventID = @EventID";
            updatedEvent.EventID = id;
            updatedEvent.LastModified = DateTime.Now;

            var rowsAffected = await _dbConnection.ExecuteAsync(sql, updatedEvent);
            if (rowsAffected == 0)
                return NotFound("Event not found");

            return NoContent();
        }

        // Delete Event
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var sql = "DELETE FROM SchedulerEvents WHERE EventID = @id";
            var rowsAffected = await _dbConnection.ExecuteAsync(sql, new { id });

            if (rowsAffected == 0)
                return NotFound("Event not found");

            return NoContent();
        }
    }
}
