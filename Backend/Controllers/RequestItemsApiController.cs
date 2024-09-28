using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using Request.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestItemsApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";

        // API for inserting a new request item
        [HttpPost("InsertRequest")]
        public async Task<IActionResult> InsertRequestItem([FromBody] RequestItem requestItem)
        {
            string insertQuery = @"
                INSERT INTO RequestItems_tb (RequestedItem, RequestedBy, SuggestedDealer, Purpose, EstimatedCost, RequestedDate, Status, Priority, Admin1Approval, Admin2Approval, Admin3Approval)
                VALUES (@RequestedItem, @RequestedBy, @SuggestedDealer, @Purpose, @EstimatedCost, @RequestedDate, @Status, @Priority, @Admin1Approval, @Admin2Approval, @Admin3Approval);
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<RequestItem>(insertQuery, new
                {
                    requestItem.RequestedItem,
                    requestItem.RequestedBy,
                    requestItem.SuggestedDealer,
                    requestItem.Purpose,
                    requestItem.EstimatedCost,
                    requestItem.RequestedDate,
                    requestItem.Status,
                    requestItem.Priority,
                    Admin1Approval = "Pending",
                    Admin2Approval = "Pending",
                    Admin3Approval = "Pending"
                });

                return Ok(result);
            }
        }

        // API for getting all request items
        [HttpGet("GetAllRequests")]
        public async Task<IActionResult> GetAllRequests()
        {
            string selectQuery = @"
                SELECT RequestID, RequestedItem, RequestedBy, SuggestedDealer, Purpose, EstimatedCost, RequestedDate, Status, Priority, Admin1Approval, Admin2Approval, Admin3Approval
                FROM RequestItems_tb;
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var requestItems = await connection.QueryAsync<RequestItem>(selectQuery);
                return Ok(requestItems);
            }
        }
    }
}
