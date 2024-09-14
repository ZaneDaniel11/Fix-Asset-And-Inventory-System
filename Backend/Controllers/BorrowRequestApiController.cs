using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using Categorys.Models;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BorrowRequestApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";

        // POST: api/Borrow/Request
        [HttpPost("Request")]
        public async Task<IActionResult> BorrowRequest([FromBody] BorrowRequest borrowRequest)
        {
            if (borrowRequest == null || !borrowRequest.Items.Any())
                return BadRequest("No items selected for borrowing.");

            var borrowDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        // Insert into Borrowreq_tb
                        const string insertBorrowRequestQuery = "INSERT INTO Borrowreq_tb (ReqBorrowDate, RequestedBy, Purpose, Status, Priority) VALUES (@ReqBorrowDate, @RequestedBy, @Purpose, @Status, @Priority); SELECT last_insert_rowid();";
                        var borrowId = await connection.ExecuteScalarAsync<int>(insertBorrowRequestQuery, new
                        {
                            ReqBorrowDate = borrowDate,
                            RequestedBy = borrowRequest.RequestedBy,
                            Purpose = borrowRequest.Purpose,
                            Status = borrowRequest.Status,
                            Priority = borrowRequest.Priority
                        }, transaction);

                        // Insert into BorrowItems_tb for each item
                        const string insertBorrowItemsQuery = "INSERT INTO BorrowItems_tb (BorrowId, ItemName, Quantity) VALUES (@BorrowId, @ItemName, @Quantity)";

                        foreach (var item in borrowRequest.Items)
                        {
                            await connection.ExecuteAsync(insertBorrowItemsQuery, new
                            {
                                BorrowId = borrowId,
                                ItemName = item.ItemName,
                                Quantity = item.Quantity
                            }, transaction);
                        }

                        transaction.Commit();
                        return Ok(new { BorrowId = borrowId });
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return StatusCode(500, $"Internal server error: {ex.Message}");
                    }
                }
            }
        }

        // GET: api/Borrow/ViewRequest/{borrowId}
        [HttpGet("ViewRequest/{borrowId}")]
        public async Task<IActionResult> ViewRequest(int borrowId)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();

                const string query = @"
                    SELECT br.ReqBorrowDate, br.RequestedBy, br.Purpose, br.Status, br.Priority, bi.ItemName, bi.Quantity
                    FROM Borrowreq_tb br
                    JOIN BorrowItems_tb bi ON br.BorrowId = bi.BorrowId
                    WHERE br.BorrowId = @BorrowId";

                var borrowDetails = await connection.QueryAsync(query, new { BorrowId = borrowId });

                if (!borrowDetails.Any())
                    return NotFound("Borrow request not found.");

                return Ok(borrowDetails);
            }
        }

        // GET: api/Borrow/AllRequests
        [HttpGet("AllRequests")]
        public async Task<IActionResult> GetAllRequests()
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();

                const string query = "SELECT * FROM Borrowreq_tb";

                var allRequests = await connection.QueryAsync(query);

                if (!allRequests.Any())
                    return NotFound("No borrow requests found.");

                return Ok(allRequests);
            }
        }
    }

    // Model for Borrow Request
    public class BorrowRequest
    {
        public string RequestedBy { get; set; }
        public string Purpose { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public List<BorrowItem> Items { get; set; }
    }

    // Model for Borrowed Items
    public class BorrowItem
    {
        public string ItemName { get; set; }
        public int Quantity { get; set; }
    }
}