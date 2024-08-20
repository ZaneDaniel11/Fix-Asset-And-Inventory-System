using Microsoft.AspNetCore.Mvc;
using Dapper;
using Backend.Models;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using Microsoft.Data.Sqlite;  // Using the correct Sqlite library
using System.Security.Claims;
using System.Text;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginApiController : ControllerBase
    {   
        private readonly string _connectionString;
        private readonly string _jwtKey;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;

        public LoginApiController(IConfiguration configuration)
        {
            // Assuming that DefaultConnection in your configuration file points to the SQLite database file
            _connectionString = "Data Source=capstone.db"; 
            _jwtKey = configuration["Jwt:Key"];
            _jwtIssuer = configuration["Jwt:Issuer"];
            _jwtAudience = configuration["Jwt:Audience"];
        }

     [HttpPost]
[Route("Authenticate")]
public async Task<IActionResult> Authenticate([FromBody] User loginUser)
{
    if (loginUser == null || string.IsNullOrEmpty(loginUser.UserName) || string.IsNullOrEmpty(loginUser.Password))
    {
        return BadRequest("Invalid login attempt.");
    }

    using (IDbConnection db = new SqliteConnection(_connectionString))
    {
        var query = "SELECT * FROM users_tb WHERE UserName = @UserName AND Password = @Password";
        var user = await db.QueryFirstOrDefaultAsync<User>(query, new { loginUser.UserName, loginUser.Password });

        if (user == null)
        {
            return Unauthorized("Invalid credentials.");
        }

        var token = GenerateJwtToken(user);

        user.Token = token;

        return Ok(user);
    }
}

       private string GenerateJwtToken(User user)
{
    var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Role, user.UserType)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        _jwtIssuer,
        _jwtAudience,
        claims,
        expires: DateTime.Now.AddHours(1),
        signingCredentials: creds);

    return new JwtSecurityTokenHandler().WriteToken(token);
}


    }
}
