using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using AssetCategorys.Models;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";

        [HttpGet("GetAssetCategory")]
        public async Task<IActionResult> GetCategoryAsync()
        {
            const string query = "SELECT * FROM asset_category_tb";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var category = await connection.QueryAsync<Category>(query);
                return Ok(category);
            }
        }

        [HttpPost("InsertAssetCategory")]
        public async Task<IActionResult> InsertCategoryAsync(Category cat)
        {
            const string query = @"
                INSERT INTO asset_category_tb (CategoryName) 
                VALUES (@CategoryName);
                SELECT * FROM category_tb ORDER BY CategoryId DESC LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<Category>(query, new { CategoryName = cat.CategoryName });

                return Ok(result);
            }
        }

        [HttpDelete("DeleteAssetCategory")]
        public async Task<IActionResult> DeleteCategoryAsync(int CategoryId)
        {
            const string query = "DELETE FROM asset_category_tb WHERE CategoryId = @CategoryId";
            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.ExecuteAsync(query, new { Id = CategoryId });
                return Ok(new { success = true });
            }
        }

        [HttpPut("UpdateAssetCategory")]
        public async Task<IActionResult> UpdateCategoryAsync(int CategoryId, Category cat)
        {

            const string query = @"
                UPDATE asset_category_tb
                SET CategoryName = @CategoryName 
                WHERE CategoryId = @CategoryId; 
                SELECT * FROM category_tb WHERE Id = @CategoryId LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<Category>(query, new { Id = CategoryId, CategoryName = cat.CategoryName });

                return Ok(result);
            }
        }
    }
}