using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using Request.Models;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestItemsApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";


        [HttpPost("InsertRequest")]
        public async Task<IActionResult> InsertRequestItem([FromBody] RequestItem requestItem)
        {
            string insertQuery = @"
        INSERT INTO RequestItems_tb (RequestedItem, Description, RequestedBy, SuggestedDealer, Purpose, EstimatedCost, RequestedDate, Status, Priority, Admin1Approval, Admin2Approval, Admin3Approval, BorrowerId)
        VALUES (@RequestedItem, @Description, @RequestedBy, @SuggestedDealer, @Purpose, @EstimatedCost, @RequestedDate, @Status, @Priority, @Admin1Approval, @Admin2Approval, @Admin3Approval, @BorrowerId);
    ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(insertQuery, new
                {
                    requestItem.RequestedItem,
                    requestItem.Description, // Description field
                    requestItem.RequestedBy,
                    requestItem.SuggestedDealer,
                    requestItem.Purpose,
                    requestItem.EstimatedCost,
                    requestItem.RequestedDate,
                    Status = "Pending", // Fix for Status field
                    requestItem.Priority,
                    Admin1Approval = "Pending",
                    Admin2Approval = "Pending",
                    Admin3Approval = "Pending",
                    requestItem.BorrowerId // Including BorrowerId in the insert
                });

                return Ok(result);
            }
        }


        // API for getting all request items
        [HttpGet("GetAllRequests")]
        public async Task<IActionResult> GetAllRequests()
        {
            string selectQuery = @"
                SELECT *
                FROM RequestItems_tb;
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var requestItems = await connection.QueryAsync<RequestItem>(selectQuery);
                return Ok(requestItems);
            }
        }

        // API for updating a request's details
        [HttpPut("UpdateRequest/{requestId}")]
        public async Task<IActionResult> UpdateRequest(int requestId, [FromBody] RequestItem updatedRequest)
        {
            string updateQuery = @"
                UPDATE RequestItems_tb 
                SET RequestedItem = @RequestedItem,
                    SuggestedDealer = @SuggestedDealer,
                    Purpose = @Purpose,
                    EstimatedCost = @EstimatedCost,
                    RequestedDate = @RequestedDate,
                    Status = @Status,
                    Priority = @Priority
                WHERE RequestID = @RequestId;
            ";

            string selectQuery = @"
                SELECT * FROM RequestItems_tb WHERE RequestID = @RequestId;
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                await connection.ExecuteAsync(updateQuery, new
                {
                    updatedRequest.RequestedItem,
                    updatedRequest.SuggestedDealer,
                    updatedRequest.Purpose,
                    updatedRequest.EstimatedCost,
                    updatedRequest.RequestedDate,
                    updatedRequest.Status,
                    updatedRequest.Priority,
                    RequestId = requestId
                });

                var updatedResult = await connection.QuerySingleOrDefaultAsync<RequestItem>(selectQuery, new { RequestId = requestId });
                return Ok(updatedResult);
            }
        }

        // API for deleting a request by RequestID
        [HttpDelete("DeleteRequest/{requestId}")]
        public async Task<IActionResult> DeleteRequest(int requestId)
        {
            string deleteQuery = @"
                DELETE FROM RequestItems_tb WHERE RequestID = @RequestId;
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(deleteQuery, new { RequestId = requestId });

                if (result > 0)
                {
                    return Ok($"Request with ID {requestId} was successfully deleted.");
                }
                else
                {
                    return NotFound($"Request with ID {requestId} was not found.");
                }
            }
        }

        // API for updating Admin1 approval and setting status based on approval, returning updated request
        [HttpPut("UpdateAdmin1Approval/{requestId}")]
        public async Task<IActionResult> UpdateAdmin1Approval(int requestId, [FromBody] string admin1Approval)
        {
            string updateQuery = @"
                UPDATE RequestItems_tb 
                SET Admin1Approval = @Admin1Approval, 
                    Status = CASE 
                        WHEN @Admin1Approval = 'Approve' THEN 'In Progress'
                        WHEN @Admin1Approval = 'Denied' THEN 'Rejected'
                        ELSE Status 
                    END
                WHERE RequestID = @RequestId;
            ";

            string selectQuery = @"
                SELECT * FROM RequestItems_tb WHERE RequestID = @RequestId;
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                await connection.ExecuteAsync(updateQuery, new
                {
                    Admin1Approval = admin1Approval,
                    RequestId = requestId
                });

                var updatedRequest = await connection.QuerySingleOrDefaultAsync<RequestItem>(selectQuery, new { RequestId = requestId });
                return Ok(updatedRequest);
            }
        }

        // API for updating Admin2 approval and setting status based on approval, returning updated request
        [HttpPut("UpdateAdmin2Approval/{requestId}")]
        public async Task<IActionResult> UpdateAdmin2Approval(int requestId, [FromBody] string admin2Approval)
        {
            string updateQuery = @"
                UPDATE RequestItems_tb 
                SET Admin2Approval = @Admin2Approval, 
                    Status = CASE 
                        WHEN @Admin2Approval = 'Approve' AND Admin1Approval = 'Approve' THEN 'In Progress'
                        WHEN @Admin2Approval = 'Denied' THEN 'Rejected'
                        ELSE Status 
                    END
                WHERE RequestID = @RequestId;
            ";

            string selectQuery = @"
                SELECT * FROM RequestItems_tb WHERE RequestID = @RequestId;
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                await connection.ExecuteAsync(updateQuery, new
                {
                    Admin2Approval = admin2Approval,
                    RequestId = requestId
                });

                var updatedRequest = await connection.QuerySingleOrDefaultAsync<RequestItem>(selectQuery, new { RequestId = requestId });
                return Ok(updatedRequest);
            }
        }

        // API for updating Admin3 approval and setting status based on approval, returning updated request
        [HttpPut("UpdateAdmin3Approval/{requestId}")]
        public async Task<IActionResult> UpdateAdmin3Approval(int requestId, [FromBody] string admin3Approval)
        {
            string updateQuery = @"
                UPDATE RequestItems_tb 
                SET Admin3Approval = @Admin3Approval, 
                    Status = CASE 
                        WHEN @Admin3Approval = 'Approve' AND Admin1Approval = 'Approve' AND Admin2Approval = 'Approve' THEN 'Approved'
                        WHEN @Admin3Approval = 'Denied' THEN 'Rejected'
                        ELSE Status 
                    END
                WHERE RequestID = @RequestId;
            ";

            string selectQuery = @"
                SELECT * FROM RequestItems_tb WHERE RequestID = @RequestId;
            ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                await connection.ExecuteAsync(updateQuery, new
                {
                    Admin3Approval = admin3Approval,
                    RequestId = requestId
                });

                var updatedRequest = await connection.QuerySingleOrDefaultAsync<RequestItem>(selectQuery, new { RequestId = requestId });
                return Ok(updatedRequest);
            }
        }

        [HttpGet("GetRequestsByBorrower/{borrowerId}")]
        public async Task<IActionResult> GetRequestsByBorrower(int borrowerId)
        {
            string selectQuery = @"
        SELECT RequestID, RequestedItem, RequestedBy, SuggestedDealer, Purpose, EstimatedCost, RequestedDate, Status, Priority, Admin1Approval, Admin2Approval, Admin3Approval, BorrowerId
        FROM RequestItems_tb
        WHERE BorrowerId = @BorrowerId;
    ";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var requestItems = await connection.QueryAsync<RequestItem>(selectQuery, new { BorrowerId = borrowerId });
                return Ok(requestItems);
            }
        }
    }
}
