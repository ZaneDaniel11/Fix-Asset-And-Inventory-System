using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using Backend.Models;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";

        // GET: api/ItemApi/GetItems
        [HttpGet("GetItems")]
        public async Task<IActionResult> GetItemsAsync()
        {
            const string query = "SELECT * FROM items_tb";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var items = await connection.QueryAsync<Item>(query);
                return Ok(items);
            }
        }

        // POST: api/ItemApi/InsertItem
        [HttpPost("InsertItem")]
        public async Task<IActionResult> InsertItemAsync(Item newItem)
        {
            const string query = @"
                INSERT INTO items_tb (CategoryID, ItemName, Quantity, Description, DateAdded) 
                VALUES (@CategoryID, @ItemName, @Quantity, @Description, @DateAdded);
                SELECT * FROM items_tb ORDER BY ItemID DESC LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<Item>(query, new
                {
                    newItem.CategoryID,
                    newItem.ItemName,
                    newItem.Quantity,
                    newItem.Description,
                    newItem.DateAdded
                });

                return Ok(result);
            }
        }

        // DELETE: api/ItemApi/DeleteItem?ItemID=1
        [HttpDelete("DeleteItem")]
        public async Task<IActionResult> DeleteItemAsync(int ItemID)
        {
            const string query = "DELETE FROM items_tb WHERE ItemID = @ItemID";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(query, new { ItemID });
                return Ok(new { success = result > 0 });
            }
        }

        // PUT: api/ItemApi/UpdateItem?ItemID=1
        [HttpPut("UpdateItem")]
        public async Task<IActionResult> UpdateItemAsync(int ItemID, Item updatedItem)
        {
            const string query = @"
                UPDATE items_tb 
                SET 
                    CategoryID = @CategoryID,
                    ItemName = @ItemName, 
                    Quantity = @Quantity, 
                    Description = @Description, 
                    DateAdded = @DateAdded
                WHERE ItemID = @ItemID;
                SELECT * FROM items_tb WHERE ItemID = @ItemID LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<Item>(query, new
                {
                    updatedItem.CategoryID,
                    updatedItem.ItemName,
                    updatedItem.Quantity,
                    updatedItem.Description,
                    updatedItem.DateAdded,
                    ItemID
                });

                return Ok(result);
            }
        }
    }
}
