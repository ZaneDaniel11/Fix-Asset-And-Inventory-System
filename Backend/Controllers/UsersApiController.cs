using Microsoft.AspNetCore.Mvc;
using Dapper;
using Microsoft.Data.Sqlite;
using Backend.Models;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersApiController : ControllerBase
    {
        private SqliteConnection _connection = new SqliteConnection("Data Source=capstone.db");

        [HttpPost("CreateUser")]
        public async Task<IActionResult> CreateUserAsync(User user)
        {
            const string query = @"INSERT INTO users_tb (UserName, Password, CreatedDate, UserType, Email, Token)
                                   VALUES (@UserName, @Password, @CreatedDate, @UserType, @Email, @Token);
                                   SELECT * FROM users_tb ORDER BY UserId DESC LIMIT 1;";
            
            var result = await _connection.QuerySingleOrDefaultAsync<User>(query, user);

            return Ok(result);
        }

        [HttpPut("UpdateUser")]
        public async Task<IActionResult> UpdateUserAsync(int UserId, User user)
        {
            const string query = @"UPDATE users_tb 
                                   SET UserName = @UserName, Password = @Password, 
                                       UserType = @UserType, Email = @Email, Token = @Token 
                                   WHERE UserId = @UserId;
                                   SELECT * FROM users_tb WHERE UserId = @UserId LIMIT 1;";
            
            var result = await _connection.QuerySingleOrDefaultAsync<User>(query, new 
            {
                user.UserName,
                user.Password,
                user.UserType,
                user.Email,
                user.Token,
                UserId
            });

            return Ok(result);
        }

        [HttpDelete("DeleteUser")]
        public async Task<IActionResult> DeleteUserAsync(int UserId)
        {
            const string query = "DELETE FROM users_tb WHERE UserId = @UserId;";
            await _connection.ExecuteAsync(query, new { UserId });

            return Ok(new { success = true });
        }

        [HttpGet("GetUsers")]
        public async Task<IActionResult> GetUsersAsync()
        {
            const string query = "SELECT * FROM users_tb;";
            var users = await _connection.QueryAsync<User>(query);
            return Ok(users);
        }
    }
}
