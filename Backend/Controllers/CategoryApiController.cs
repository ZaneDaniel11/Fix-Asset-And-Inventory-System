using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using Categorys.Models;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryApiController : ControllerBase
    {
        private readonly string _connectionString = "Data Source=capstone.db";

        [HttpGet("GetCategory")]
        public async Task<IActionResult> GetCategoryAsync()
        {
            const string query = "SELECT * FROM category_tb";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var category = await connection.QueryAsync<Category>(query);
                return Ok(category);
            }
        }

        [HttpPost("InsertCategory")]
        public async Task<IActionResult> InsertCategoryAsync(Category cat)
        {
            const string query = @"
                INSERT INTO category_tb (CategoryName) 
                VALUES (@CategoryName);
                SELECT * FROM category_tb ORDER BY Id DESC LIMIT 1;";

            using (var connection = new SqliteConnection(_connectionString))
            {
                connection.Open();
                var result = await connection.QuerySingleOrDefaultAsync<Category>(query, new { CategoryName = cat.CategoryName });

                return Ok(result);
            }
        }
    }
}
