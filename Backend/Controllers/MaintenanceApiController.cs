using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using System.Threading.Tasks;
using System.Collections.Generic;
using Maintenace.Models;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";
        [HttpPost("InsertMaintenance")]
        public async Task<IActionResult> InsertMaintenanceAsync(Maintenance newMaintenance)
        {
            const string insertQuery = @"
        INSERT INTO maintenance_tb 
        (ItemID, CategoryID, AssetName, AssetCode, Location, Issue, RequestDate, RequestedBy, 
         RequesterID, MaintenanceStatus, AssignedTo, ScheduledDate, CompletionDate, Description, 
         ApprovalStatus, ApprovedByAdmin1, ApprovedByAdmin2) 
        VALUES 
        (@ItemID, @CategoryID, @AssetName, @AssetCode, @Location, @Issue, @RequestDate, @RequestedBy, 
         @RequesterID, @MaintenanceStatus, @AssignedTo, @ScheduledDate, @CompletionDate, @Description, 
         @ApprovalStatus, @ApprovedByAdmin1, @ApprovedByAdmin2);
        SELECT * FROM maintenance_tb ORDER BY MaintenanceID DESC LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Insert maintenance request and retrieve the newly created record
                var result = await connection.QuerySingleOrDefaultAsync<Maintenance>(insertQuery, new
                {
                    newMaintenance.ItemID,
                    newMaintenance.CategoryID,
                    newMaintenance.AssetName,
                    newMaintenance.AssetCode,
                    newMaintenance.Location,
                    newMaintenance.Issue,
                    newMaintenance.RequestDate,
                    newMaintenance.RequestedBy,
                    newMaintenance.RequesterID,
                    newMaintenance.MaintenanceStatus,
                    newMaintenance.AssignedTo,
                    newMaintenance.ScheduledDate,
                    newMaintenance.CompletionDate,
                    newMaintenance.Description,
                    newMaintenance.ApprovalStatus,
                    newMaintenance.ApprovedByAdmin1,
                    newMaintenance.ApprovedByAdmin2
                });

                return Ok(result); // Return the newly inserted maintenance record
            }
        }

    }
}