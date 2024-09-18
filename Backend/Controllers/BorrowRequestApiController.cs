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

        [HttpGet("RequestsByBorrowerId")]
        public async Task<IActionResult> GetRequestsByBorrowerId([FromQuery] int borrowerId)
        {
            try
            {
                using (var connection = new SqliteConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    const string query = @"
                        SELECT br.BorrowId, br.ReqBorrowDate, br.RequestedBy, br.Purpose, br.Status, br.Priority, bi.ItemName, bi.Quantity
                        FROM Borrowreq_tb br
                        JOIN BorrowItems_tb bi ON br.BorrowId = bi.BorrowId
                        WHERE br.BorrowerId = @BorrowerId";

                    var borrowerRequests = await connection.QueryAsync(query, new { BorrowerId = borrowerId });

                    if (!borrowerRequests.Any())
                        return NotFound("No borrow requests found for this borrower.");

                    return Ok(borrowerRequests);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

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
                        // Insert into Borrowreq_tb with BorrowerId
                        const string insertBorrowRequestQuery = @"
                            INSERT INTO Borrowreq_tb (ReqBorrowDate, RequestedBy, Purpose, Status, Priority, BorrowerId) 
                            VALUES (@ReqBorrowDate, @RequestedBy, @Purpose, @Status, @Priority, @BorrowerId); 
                            SELECT last_insert_rowid();";

                        var borrowId = await connection.ExecuteScalarAsync<int>(insertBorrowRequestQuery, new
                        {
                            ReqBorrowDate = borrowDate,
                            RequestedBy = borrowRequest.RequestedBy,
                            Purpose = borrowRequest.Purpose,
                            Status = borrowRequest.Status,
                            Priority = borrowRequest.Priority,
                            BorrowerId = borrowRequest.BorrowerId
                        }, transaction);

                        // Insert into BorrowItems_tb for each item
                        const string insertBorrowItemsQuery = "INSERT INTO BorrowItems_tb (BorrowId, ItemName, Quantity) VALUES (@BorrowId, @ItemName, @Quantity)";
                        const string updateItemQuantityQuery = "UPDATE items_db SET Quantity = Quantity - @Quantity WHERE ItemName = @ItemName AND Quantity >= @Quantity";

                        foreach (var item in borrowRequest.Items)
                        {
                            // Insert into BorrowItems_tb
                            await connection.ExecuteAsync(insertBorrowItemsQuery, new
                            {
                                BorrowId = borrowId,
                                ItemName = item.ItemName,
                                Quantity = item.Quantity
                            }, transaction);

                            // Update item quantity in items_db
                            var rowsAffected = await connection.ExecuteAsync(updateItemQuantityQuery, new
                            {
                                ItemName = item.ItemName,
                                Quantity = item.Quantity
                            }, transaction);

                            if (rowsAffected == 0)
                            {
                                transaction.Rollback();
                                return BadRequest($"Not enough stock for {item.ItemName}.");
                            }
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

        // GET: api/Borrow/RequestsByBorrower/{borrowerId}
        [HttpGet("RequestsByBorrower/{borrowerId}")]
        public async Task<IActionResult> GetRequestsByBorrower(int borrowerId)
        {
            using (var connection = new SqliteConnection(_connectionString))
            {
                await connection.OpenAsync();
                Console.WriteLine($"Fetching requests for borrowerId: {borrowerId}");  // Add this log

                const string query = @"
            SELECT br.BorrowId, br.ReqBorrowDate, br.RequestedBy, br.Purpose, br.Status, br.Priority, bi.ItemName, bi.Quantity
            FROM Borrowreq_tb br
            JOIN BorrowItems_tb bi ON br.BorrowId = bi.BorrowId
            WHERE br.BorrowerId = @BorrowerId";

                var borrowRequests = await connection.QueryAsync(query, new { BorrowerId = borrowerId });

                if (!borrowRequests.Any())
                    return NotFound("No borrow requests found for this borrower.");

                return Ok(borrowRequests);
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
        public int BorrowerId { get; set; }  // BorrowerId added here
        public List<BorrowItem> Items { get; set; }
    }

    // Model for Borrowed Items
    public class BorrowItem
    {
        public string ItemName { get; set; }
        public int Quantity { get; set; }
    }
}
